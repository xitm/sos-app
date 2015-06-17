angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, DataModel, Session, $state, $filter, $ionicPopup, $ionicPlatform) {
    $scope.clicked = false;
    $scope.date = new Date();
    
    //$ionicPlatform.onHardwareBackButton(function() {
    // event.preventDefault();
    // event.stopPropagation();
    // console.log('going back now yall');
    //);
    
    $scope.callSessiondetail = function() {
        //clients für Auswahllisten
        var clients = model.dataModel.getClienten();
        
        //client für ausgewählten Kunden
        var client = document.getElementById('kunde')
        var check = false; //Ueberpruefungsvariable fuer den Kunden, ob es ihn gibt
        
        //Überprüfen ob Client exisitert und ID speichern
        for(var i=0,anz=clients.length;i<anz;i++){
            if(client.value === (clients[i].getVorname() + ' ' + clients[i].getNachname())){
                client.setAttribute('data-id', clients[i].getId());
                check = true;
            }
        }
        
        //Fehlerbehandlung Kunde
        if (document.getElementById('kunde').value=="") {
            $ionicPopup.alert ({
                title: "Kein Klient eingetragen!",
                template: "Bitte zuerst einen Klienten angeben"
            })
            return;
        }
        if (!check) {
            $ionicPopup.alert ({
                title: "Klient nicht bekannt!",
                template: "Bitte einen gültigen Klienten angeben"
            })
            return;
        }
        
        //SessionId vergeben
        if (!model.dataModel.getMitarbeiter().getSessions()){
            var sessionid = 0;
        } else {
            var sessionid = model.dataModel.getMitarbeiter().getSessions().length;
        }
        //Routine, das im localstorage zu speicher fehlt noch! --> damit das App auch geschlossen und wieder geöffnet werden kann.
        
        /*------------------*/
        //Session erstellen
        var session = new Session.create(
            {id: sessionid,
            beginn: new Date(document.getElementById("datum").value), //Datum vom Auswahlfeld
            ende: new Date(document.getElementById("datum").value),
            clientId: client.getAttribute('data-id')//clientId
            }
        )
        //Setactive von Session
        session.setActive(true); //Routine erstellen die setActives überprüft!!!!
        
        //Session hinzufügen
        model.dataModel.getMitarbeiter().addSession(session) //session zum MA hinzufuegen
        DataModel.update(model.dataModel, true); //model im local storage updaten
        //Sessionmanager aufrufen
        $state.go('sessiondetail')
    }
    
    $scope.callSessionuebersicht = function() {
        $state.go('sessionuebersicht')
    }
    //Clienten fuer die Uebersicht ///OPTIMIERUNGSPOTENTIAL; MIT var clients verbinden!
    $scope.contacts = model.dataModel.getClientList();
    
    for(var i=0,anz=$scope.contacts.length;i<anz;i++){
        $scope.contacts[i].fullName = $scope.contacts[i].vorname + " " + $scope.contacts[i].nachname;
    }
    
    $scope.searchContacts = function(query) {
        $scope.clicked = false
        $scope.queryData = $filter('filter')($scope.contacts, query);
    }
    
    $scope.updateInput = function (contact) {
        var kunde=document.getElementById('kunde');
        kunde.value=contact.vorname + ' ' + contact.nachname;
        kunde.setAttribute('data-id', contact.id);
        $scope.clicked = true;
    }
})

.controller('LoginCtrl', function($scope, LoginService, DataModel, $http, $state, $ionicLoading, $ionicPopup) {
        $ionicLoading.show({
            template : "<div my-temp-template></div>"
        });
        if (localStorage.getItem("mle_model2")===null) { //wenn kein lokaler Speicher besteht -> nur beim ersten Mal der Fall!
            console.log("Baut Internetverbindung auf!");
            model.dataModel = DataModel.syncWithSource(model.dataModel, true); //sync mit Webservice
            model.dataModel.then(function(data){ //ergebnis des Promises, also was passiert nunt?
                model.dataModel = data;
                DataModel.update(model.dataModel, true);
                $ionicLoading.hide();
                },
                function(error){
                    $ionicLoading.hide();
                    alert(error);
            });
        }else{
            model.dataModel = DataModel.create(localStorage.getItem("mle_model2")); //Anpassung an neue Service-Gestaltung
            $ionicLoading.hide();
            console.log("Baut keine Internetverbindung auf!");
            //model.dataModel = DataModel.syncWithSource(model.dataModel); //sync mit Webservice
        }
        


    $scope.init = function() {
      $scope.passcode = "";
    }
    $scope.add = function(value) {
      if($scope.passcode.length < 4) {
        $scope.passcode = $scope.passcode + value;
        if($scope.passcode.length == 4) {
            LoginService.loginUser($scope.passcode).success(function(data) {
                $state.go('sessionuebersicht');
            }).error(function(data) {
              var alertPopup = $ionicPopup.alert({
                  title: 'Login failed!',
                  template: 'Bitte den Pin überprüfen'
                });
              $scope.passcode = "";
            });
        }
      }
    }
    $scope.delete = function() {
      if($scope.passcode.length > 0) {
        $scope.passcode = $scope.passcode.substring(0, $scope.passcode.length - 1);
      }
    }
})

.controller('SessionmanagerCtrl', function($scope, DataModel, $state, $ionicPopup) {
    //aktive Session aus dem Datenmodell
    var currentsession = model.dataModel.getActiveSession();
    
    $scope.callArbeitsoberflaeche = function() {
        //Routine um aktive Session zu verwerfen
        var goArbeitsoberflaeche = true;
        //Prüfen ob bereits Arbeits und/oder Fahrtzeiten vorhanden sind
        if (!(currentsession.getFahrten()[0]) && !(currentsession.getArbeiten()[0])) {
            model.dataModel.deleteActiveSession();//löscht aktive Session - keine offenen Sessions mehr
            DataModel.update(model.dataModel, true); //model im local storage updaten
            $state.go('arbeitsoberflaeche');
        }
        else {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Session Verwerfen?',
                template: 'Du hast noch offene Fahrt- und Arbeitszeiten gespeichert. Möchtest du diese verwerfen?'
            });
            confirmPopup.then(function(res) {
                if(res) {
                    model.dataModel.deleteActiveSession();//löscht aktive Session - keine offenen Sessions mehr
                    DataModel.update(model.dataModel, true); //model im local storage updaten
                    /*für sessionübersicht freigeben und in arbeitsübersicht wechseln*/
                    $state.go('arbeitsoberflaeche');
                } else {
                    return;
                    /*Alles bleibt so wie es ist!*/
                }
            });
        }
    }
    $scope.callArbeitsmanager = function() {
        $state.go('arbeitsmanager', {sessionmanager: true});
        
    }
    $scope.callFahrtenmanager = function() {
        $state.go('fahrtenmanager', {sessionmanager: true});
    }
    $scope.finishSession = function() {
        
        //Wenn noch keine Session eingetragen ist, kann nichts abgeschlossen werden.
        if ((!currentsession.getFahrten()[0]) && !(currentsession.getArbeiten()[0])) {
            var alertPopup = $ionicPopup.alert({
                title: "Fehler",
                template: "Es wurden noch keine Fahrt- oder Arbeitseinheiten eingetragen"
            })
            return;
        }
        
        /*Änderungen speichern?*/
        /*Sessiondetails hier drin wären nett*/
        var confirmPopup = $ionicPopup.confirm({
          title: 'Session Abschließen?',
          template: 'Möchtest du die Arbeits- und Fahrtzeiten zum hochladen freigeben?'
        });
        confirmPopup.then(function(res) {
          if(res) {
            model.dataModel.getActiveSession().setActive(false);
            DataModel.update(model.dataModel, true); //model im local storage aktualisieren
            $state.go('arbeitsoberflaeche');
          } else {
            /*Alles bleibt so wie es ist!*/
          }
        });
    }
})

.controller('SessionuebersichtCtrl', function($scope, $state, $ionicPopup, DataModel, $ionicViewSwitcher, $ionicLoading) {
    $scope.callSessiondetail=function(sessionId){
        model.dataModel.getSessionById(sessionId).setActive(true); //Session wird aktiv gesetzt
        $ionicViewSwitcher.nextDirection('forward'); //Richtung der Animation festlegen
        $state.go('sessiondetail');
    }
    $scope.callArbeitsoberflaeche = function() {
        $state.go('arbeitsoberflaeche');
    }
    
    $scope.updateDatabase = function() {
        var sessions = model.dataModel.getMitarbeiter().getSessions(); //Sessions cachen
        var sessionCount = 0; //Anzahl der upzuloadenden Session fuer das Pop-Up herausfinden
        for (var i=0, anz=sessions.length; i<anz;i++) {
            if (sessions[i].getDeleted()===false) {
                sessionCount++;
            }
        }
        
        
        //popup  vor hochladen
        var confirmPopup = $ionicPopup.confirm({
            title: "Sessions Hochladen",
            template: sessionCount + " Session werden hochgeladen. Bitte um Bestätigung"
        });
        confirmPopup.then(function(res) {
            if (res) {
                $ionicLoading.show({
                    template : "<div my-temp-template></div>"
                });
                //Session hochladen
                DataModel.uploadData(model.dataModel, function(){
                    model.dataModel = DataModel.syncWithSource(model.dataModel, true); //sync mit Webservice
                    model.dataModel.then(function(data){ //ergebnis des Promises, also was passiert nunt?
                        model.dataModel = data;
                        DataModel.update(model.dataModel, true);
                        $ionicLoading.hide();
                        $state.reload();
                        },
                        function(error){
                            $ionicLoading.hide();
                            alert(error);
                    });
                });
                
            }else {
                //nichts machen
            }
        });
    }
})

.controller('SessiondetailCtrl', function($scope, TimeCalculatorService, $state, DataModel, $ionicPopup, $ionicViewSwitcher) {
    $scope.activeSession = model.dataModel.getActiveSession(); //speichert aktive Session in den Scope
    $scope.fahrten = $scope.activeSession.toJson().fahrten; //speichert die Fahrten extra ab, für den ng-repeat
    $scope.arbeiten = $scope.activeSession.toJson().arbeiten;//speichert die Arbeiten extra ab, für den ng-repeat
    
    //addet die LeistungsId sowie den Namen der Leistung zur $scope-variable
    for (var i=0,anz=model.dataModel.getLeistungen().length;i<anz;i++) { //sucht sich die Leistung heraus, die die Arbeit hat!
        var _ls = model.dataModel.getLeistungen()[i];
        if ($scope.arbeiten.leistungsId === _ls.getId()) {
           $scope.arbeiten.leistung = _ls.getName();
           return;
        }
    }
    
    //Sessiondatum
    var date = $scope.activeSession.timeFrame()
    if (new Date(date.min).toString().substring(0,10) == new Date(date.max).toString().substring(0,10)) {
        $scope.date = new Date(date.min).toString().substring(0,10);
    } else {
        $scope.date = new Date(date.min).toString().substring(0,10) + " - " + new Date(date.max).toString().substring(0,10);
    }

    $scope.totalDiffTime = 0; //leeres Object fuer die Differenz der Zeit
    $scope.totalDiffRoute = 0; //Differenz der Route
    
    //vollstaendiger Name des Klienten
    $scope.client = model.dataModel.getClientById($scope.activeSession.getClientId()).getFullName();
    
    //Falls keine Arbeits -oder Zeiteinheiten vorhanden sind. Textmeldung auf true setzen
    $scope.emptywork = false;
    $scope.emptytrip = false;
    if ($scope.arbeiten.length==0) {
        $scope.emptywork = true;
    }
    if ($scope.fahrten.length == 0) {
        $scope.emptytrip = true;
    }

    
    for(var i=0,anz=$scope.fahrten.length;i<anz;i++){
        var _fa = $scope.fahrten[i]; //Fahrt des aktuellen Durchlaufs
        var diff = TimeCalculatorService.difference(_fa); //caching der Zeitdifferenz der aktuellen Fahrt
        
        _fa.diffRoute = parseFloat(_fa.endkilometer)-parseFloat(_fa.anfangskilometer);//caching der Kilometerdifferenz
        $scope.totalDiffRoute += _fa.diffRoute; //hinzuzaehlen zur gesamten Differenz
        if (diff.days!=0) {
            var days = diff.days + " Tage ";
        }else{
            var days = "";
        }
        _fa.differenz = days + diff.hours + " Stunden " + diff.minutes + " Minuten"; //ausgabe zurechtschneiden
        
        diff = TimeCalculatorService.createDateInMs(diff);
        addToTotalTime(diff); //Zeitdifferenz dazuzaehlen
    }
    
    for(var i=0,anz=$scope.arbeiten.length;i<anz;i++){
        var _ar = $scope.arbeiten[i]; //Arbeit des aktuellen Durchlaufs
        var diff = TimeCalculatorService.difference(_ar); //caching der Zeitdifferenz
        
        if (diff.days!=0) {
            var days = diff.days + " Tage ";
        }else{
            var days = "";
        }
        _ar.differenz = days + diff.hours + " Stunden " + diff.minutes + " Minuten"; //ausgabe zurechtschneiden
        
        diff = TimeCalculatorService.createDateInMs(diff);
        addToTotalTime(diff); //zur gesamten Dauer hinzufuegen
        var leistungsId= _ar.leistungsId; //caching LeistungsId
        $scope.arbeiten[i].leistung=model.dataModel.getLeistungById(leistungsId).getName(); //Namen der Leistung ausgeben!
    }
    
        $scope.totalDiffTime = TimeCalculatorService.createDateObject($scope.totalDiffTime);
         if ($scope.totalDiffTime.days != 0) {
            $scope.taglabel = "Tage";
         } else {
            $scope.taglabel= "";
            $scope.totalDiffTime.days = null;
         }

    function addToTotalTime(time){ //funktion erstellt, da sie 2 mal gebraucht wird!
        $scope.totalDiffTime += time;

    }
    
    function substractFromTotalTime(time){
        $scope.totalDiffTime.hours -= time.hours;
        $scope.totalDiffTime.minutes -= time.minutes;
        $scope.totalDiffTime.days -= time.days;
    }
    
    //Object zur Ueberpruefung der Loeschung
    $scope.data = {
        showArbeit: false,
        showFahrt: false
    };
  
    //Funktion zur Loeschung einzelner Einheiten
    $scope.checkDelete= function (change, $event) {
        if ($scope.data.showArbeit==true && change=="hideArbeit") { //wenn Loeschung der Arbeit aktiv -> bei Klick deaktivieren
            $scope.data.showArbeit=false;
        }else if ($scope.data.showFahrt==true && change=="hideFahrt"){ //wenn Loeschung der Fahrt aktiv -> bei Klick deaktivieren
            $scope.data.showFahrt= false;
        }else if (change=="fahrt" || change=="arbeit") {
            if (change == "arbeit") { //wenn Arbeit angeklickt wurde -> Loeschung Arbeit aktivieren
                $scope.data = {showArbeit:true,
                               showFahrt:false};
            } else { //wenn Fahrt angeklickt wurde -> Loeschung Fahrt aktivieren
                $scope.data = {showFahrt:true,
                               showArbeit:false};
            }
            if ($event.stopPropagation) $event.stopPropagation();
            if ($event.preventDefault) $event.preventDefault();
            $event.cancelBubble = true;
            $event.returnValue = false;
        }
    }
    
    
    $scope.onItemDelete = function(id, typ) {
        var deleteIndex = undefined; //geklickter index finden
        if (typ == "arbeit") { //beim Einheitstyp Arbeit wird die betroffene Arbeit geloescht und aus der Uebersicht entfernt
            for(var i=0,anz=$scope.arbeiten.length;i<anz;i++){
                var _ar = $scope.arbeiten[i];
                if (id === _ar.id) {
                    deleteIndex = i;
                    break;
                }
            }
            var _ar = $scope.arbeiten[i];
            diff = TimeCalculatorService.difference(_ar); //caching der Zeitdifferenz der aktuellen Fahrt
            substractFromTotalTime(diff); //Zeitdifferenz dazuzaehlen
            $scope.arbeiten.splice(deleteIndex,1); //aus der Ansicht im Fenster loeschen - Grund: JSON zu loeschen hat auf Model keine direkte Auswirkung! umgekehrt aktualisiert sich die Ansicht nicht sofort (erst bei neuem Laden), wenn aus dem Model etwas geloescht wird
            model.dataModel.getActiveSession().getArbeiten().splice(deleteIndex, 1); //aus dem array der sessions wird der ausgewaehlt, der geloescht werden soll
            DataModel.update(model.dataModel, true); //speichern//Geht noch nicht!!!!
            
            //Ueberpruefen, ob Arbeiten vorhanden sind
            if (!($scope.arbeiten[0])) {
                $scope.emptywork=true;
            }
            
        } else if (typ == "fahrt") { //beim Einheitstyp Fahrt wird die betroffene Fahrt geloescht und aus der Uebersicht entfernt
            for(var i=0,anz=$scope.fahrten.length;i<anz;i++){
                var _fa = $scope.fahrten[i];
                if (id === _fa.id) {
                    deleteIndex = i;
                    break;
                }
            }
            
            var _delFa = $scope.fahrten[i];
            _delFa.diffRoute = parseFloat(_fa.endkilometer)-parseFloat(_fa.anfangskilometer);//caching der Kilometerdifferenz
            $scope.totalDiffRoute -= _fa.diffRoute; //hinzuzaehlen zur gesamten Differenz 
            diff = TimeCalculatorService.difference(_fa); //caching der Zeitdifferenz der aktuellen Fahrt
            substractFromTotalTime(diff); //Zeitdifferenz dazuzaehlen
            
            $scope.fahrten.splice(deleteIndex, 1);  //aus der Ansicht im Fenster loeschen - Grund: JSON zu loeschen hat auf Model keine direkte Auswirkung!
            model.dataModel.getActiveSession().getFahrten().splice(deleteIndex, 1);//aus dem array der sessions wird der ausgewaehlt, der geloescht werden soll
            DataModel.update(model.dataModel, true); //speichern
            
            //Ueberpruefen, ob Fahrten vorhanden sind
            if (!($scope.fahrten[0])) {
                $scope.emptytrip=true;
            }
            
        
        }
        
    }    
    
    $scope.callFahrtenmanager = function() {
        $state.go('fahrtenmanager', {sessionmanager: false});
    }
    $scope.callArbeitsmanager = function() {
        $state.go('arbeitsmanager', {sessionmanager: false});
    }
    
    $scope.callSessionuebersicht = function(sessionId){
        
        
        //Sind Fahrten oder Arbeiten vorhanden?
        if (!(model.dataModel.getActiveSession().getFahrten()[0]) && !(model.dataModel.getActiveSession().getArbeiten()[0])) {
            var confirmPopup = $ionicPopup.confirm({ //wenn nein -> Session loeschen?
                title: "Keine Einheiten vorhanden",
                template: "In dieser Session sind keine Arbeits- und Fahrteinheiten mehr vorhanden, bei OK wird diese Session gelöscht"
            })
            confirmPopup.then(function(res) {
                    if(res) {//wenn ja, Session wird geloescht
                        var id= model.dataModel.getActiveSession().toJson().id; //SessionId
                        model.dataModel.getSessionList().splice(id, 1); //aus dem array der sessions wird der ausgewaehlt, der geloescht werden soll
                        model.dataModel.getSessionById(id).setDeleted(true); //selbe session wird auf "deleted = true" gesetzt
                        DataModel.update(model.dataModel, true); //speichern
                        $ionicViewSwitcher.nextDirection('back');
                        $state.go('sessionuebersicht');
                    } else {
                      /*Alles bleibt so wie es ist!*/
                    }
                });
        } else { //sonst, speichern!
            model.dataModel.getActiveSession().setActive(false);
            $ionicViewSwitcher.nextDirection('back')
            $state.go('sessionuebersicht');
            DataModel.update(model.dataModel, true);
        }
        
    }
    
    $scope.callSessionbearbeitungFahrt = function(fahrtId){
        $scope.activeSession.getFahrtById(fahrtId).setActive(true);
        $state.go('fahrtenmanager');
    }
    
    $scope.callSessionbearbeitungArbeit = function(arbeitsId){
        $scope.activeSession.getArbeitById(arbeitsId).setActive(true);
        $state.go('arbeitsmanager');
    }
})

.controller('ArbeitsmanagerCtrl', function($scope, $state, Arbeit, DataModel, $ionicPopup, FormvalidationService, TimeCalculatorService, $stateParams) {
    //aktuelle Session des Modells
    var currentsession = model.dataModel.getActiveSession();
    if (model.dataModel.getActiveArbeit(currentsession)) {
        var activeArbeitObj = model.dataModel.getActiveArbeit(currentsession);
        var activeArbeit = model.dataModel.getActiveArbeit(currentsession).toJson();
        $scope.bearbeitung  = true;
        $scope.erstellung  = false;
    }else{
        var activeArbeit = undefined;
        $scope.erstellung  = true;
        $scope.bearbeitung  = false;
    }

    $scope.leistungen = model.dataModel.getLeistungList('arbeit'); //Leistungen im JSON-Format
    

    //Gespeichertes Datum voreintragen
    $scope.arbeit = {
        anfangsdatum: activeArbeit?new Date(activeArbeit.beginn):new Date(currentsession.getBeginn()), //Da currentsession bereits instanceof Session -> keine Suche im Index mehr!
        enddatum:  activeArbeit?new Date(activeArbeit.ende):new Date(currentsession.getEnde()), //ENDDATUM!!!
    }
    
    if (activeArbeit && activeArbeit.leistungsId!=undefined && activeArbeit.leistungsId!=null) {
        for(var i=0, anz=$scope.leistungen.length; i<anz; i++){
            var _tempLeis = $scope.leistungen[i];
            if (activeArbeit.leistungsId===_tempLeis.id) {
                $scope.selected = {value : i};
                break;
            }
        }
    }
    
    if (activeArbeit) {
        var anfang = {
            hours: (new Date(activeArbeit.beginn).getHours()==0)?("00"):((new Date(activeArbeit.beginn).getHours()<10 && new Date(activeArbeit.beginn).getHours()!=0)?("0"+new Date(activeArbeit.beginn).getHours()):(new Date(activeArbeit.beginn).getHours())),
            minutes: (new Date(activeArbeit.ende).getMinutes()==0)?("00"):((new Date(activeArbeit.beginn).getMinutes()<10  && new Date(activeArbeit.beginn).getMinutes()!=0)?("0"+new Date(activeArbeit.beginn).getMinutes()):(new Date(activeArbeit.beginn).getMinutes()))
        }
        var ende = {
            hours: (new Date(activeArbeit.ende).getHours()==0)?("00"):((new Date(activeArbeit.ende).getHours()<10 && new Date(activeArbeit.ende).getHours()!=0)?("0"+new Date(activeArbeit.ende).getHours()):(new Date(activeArbeit.ende).getHours())),
            minutes: (new Date(activeArbeit.ende).getMinutes()==0)?("00"):((new Date(activeArbeit.ende).getMinutes()<10 && new Date(activeArbeit.ende).getMinutes()!=0)?("0"+new Date(activeArbeit.ende).getMinutes()):(new Date(activeArbeit.ende).getMinutes()))
        }
    }
     
    //console.log($scope.selectLeistung);
    $scope.uhranfang = activeArbeit?(anfang.hours + ":" + anfang.minutes):null;
    $scope.uhrende = activeArbeit?(ende.hours + ":" + ende.minutes):null;
    
    
    $scope.callSessiondetail = function(save) {
        //console.log($scope.selectLeistung);
        if (save===false) {
            if (activeArbeit) {
                activeArbeitObj.setActive(false);
            }
            $state.go('sessiondetail');
            return;
        }
        var leis = document.getElementById("leistung");
        var leisId = leis.options[leis.selectedIndex].getAttribute('data-leistungs-id');
        

        var anfangsdatum = new Date(document.getElementById("anfangsdatum").value);
        var enddatum = new Date(document.getElementById("enddatum").value);
        var anfangszeit = document.getElementById("timeA").value;
        var endzeit = document.getElementById("timeE").value;
        var beginn = TimeCalculatorService.createDateInMs(anfangsdatum, anfangszeit);
        var ende = TimeCalculatorService.createDateInMs(enddatum, endzeit);
        
        var dauer = TimeCalculatorService.createDateObject(ende-beginn)
        console.log(dauer);
        if (dauer.stunden<0 || dauer.minutes<0 || dauer.days<0 || dauer.months<0 || dauer.years<0) {
            var alertPopup = $ionicPopup.alert({
                title:"Fehler",
                template: "Die Dauer der Arbeit ist kleiner 0!"
            })
            return
        }
        //Fehlerbehandlung, zuerst CSS wieder normal machen
        var passt = FormvalidationService.validateArbeit();
        
        
        //ArbeitsId ermitteln
        if (!currentsession.getArbeiten()){ //currentsession instanceof Session -> keine Suche im Array mehr notwendig
            var arbeitsId = 0
        } else {
            var arbeitsId = currentsession.getArbeiten().length; //currentsession instanceof Session -> keine Suche im Array mehr notwendig
        }
        
        //Testvariable abfragen
        if (passt) {
            var tage = (dauer.days!=0)?(dauer.days + " Tage "):"";
            var dates = (new Date(ende).toString().substring(0,10) != new Date(beginn).toString().substring(0,10))?(" bis " + new Date(ende).toString().substring(0,10)):"";
            
            var confirmPopup = $ionicPopup.confirm({
                title: 'Arbeitszeit hinzufügen',
                template: 'Folgende Arbeitsdaten werden erfasst: <br/>'
                        + leis.options[leis.selectedIndex].text
                        + '<br /> von ' + new Date(beginn).toString().substring(0,10) + dates
                        + '<br /> von ' + anfangszeit + " bis " + endzeit
                        + ' (' + tage + dauer.hours + 'h ' + dauer.minutes + 'min)'  //Arbeitsdaten!!! Geht das noch schöner?
                        
            });
            confirmPopup.then(function(res) {
                if(res) {
                    /*arbeitssession freigeben und in sessionmanager wechseln*/
                    var beginn = new Date(document.getElementById("anfangsdatum").value);
                    var ende = new Date(document.getElementById("enddatum").value);
                    var anfangszeit = document.getElementById("timeA").value;
                    var endzeit = document.getElementById("timeE").value;
                    beginn = TimeCalculatorService.createDateInMs(beginn, anfangszeit);
                    ende = TimeCalculatorService.createDateInMs(ende, endzeit);
                    
                    if (activeArbeit) {
                        //activeArbeitObj.setAnfangsdatum(_anfangsdatum);
                        //activeArbeitObj.setEnddatum(_enddatum);
                        //activeArbeitObj.setAnfangszeit(_anfangszeit);
                        //activeArbeitObj.setEndzeit(_endzeit);
                        activeArbeitObj.setBeginn(beginn);
                        activeArbeitObj.setEnde(ende);
                        activeArbeitObj.setLeistungsId(leisId);
                        activeArbeitObj.setActive(false);
                    }else{
                    var arbeit = new Arbeit.create({
                        id: arbeitsId,
                        //anfangsdatum: _anfangsdatum,
                        //enddatum: _enddatum,
                        //anfangszeit: _anfangszeit,
                        //endzeit: _endzeit,
                        beginn : beginn,
                        ende : ende,
                        leistungsId : leisId
                    })
                    currentsession.addArbeit(arbeit); //currentsession instanceof Session -> keine Suche im Array mehr notwendig
                  }
                  
                  
                  DataModel.update(model.dataModel, true);//model im local storage aktualisieren
                  
                  if ($stateParams.sessionmanager == true) {
                    $state.go('sessionmanager');
                  } else {
                    $state.go('sessiondetail');
                  }
                } else {
                  
                  /*Alles bleibt so wie es ist!*/
                }
            });
        } else {
            /*Alles bleibt so wie es ist!*/
        }
        
    }
})

.controller('FahrtenmanagerCtrl', function($scope, DataModel, Fahrt, $state, $ionicPopup, FormvalidationService, TimeCalculatorService, $stateParams) {
    //aktuelle Session
    var currentsession = model.dataModel.getActiveSession();
    
    if (model.dataModel.getActiveFahrt(currentsession)) {
        var activeFahrtObj = model.dataModel.getActiveFahrt(currentsession);
        var activeFahrt = model.dataModel.getActiveFahrt(currentsession).toJson();
        $scope.bearbeitung  = true;
        $scope.erstellung  = false;
    }else{
        var activeFahrt = undefined;
        $scope.erstellung  = true;
        $scope.bearbeitung  = false;
    }
    
    $scope.back = function() {
        $state.go('sessiondetail'); //Zurueck in die Sessiondetails
    }
    $scope.leistungen = model.dataModel.getLeistungList('fahrt');
    if (activeFahrt && activeFahrt.leistungsId!=undefined && activeFahrt.leistungsId!=null) {
        for(var i=0, anz=$scope.leistungen.length; i<anz; i++){
            var _tempLeis = $scope.leistungen[i];
            if (activeFahrt.leistungsId===_tempLeis.id) {
                $scope.selected = {value : i};
                break;
            }
        }
    }
    

    //Datum eintragen
    $scope.fahrt = {
        anfangsdatum: activeFahrt?new Date(activeFahrt.beginn):new Date(currentsession.getBeginn()), //Da currentsession bereits instanceof Session -> keine Suche im Index mehr!
        enddatum:  activeFahrt?new Date(activeFahrt.ende):new Date(currentsession.getEnde()), //ENDDATUM!!!
    }
    if (activeFahrt) {
        var anfang = {
            hours: (new Date(activeFahrt.beginn).getHours()==0)?("00"):((new Date(activeFahrt.beginn).getHours()<10 && new Date(activeFahrt.beginn).getHours()!=0)?("0"+new Date(activeFahrt.beginn).getHours()):(new Date(activeFahrt.beginn).getHours())),
            minutes: (new Date(activeFahrt.ende).getMinutes()==0)?("00"):((new Date(activeFahrt.beginn).getMinutes()<10  && new Date(activeFahrt.beginn).getMinutes()!=0)?("0"+new Date(activeFahrt.beginn).getMinutes()):(new Date(activeFahrt.beginn).getMinutes()))
        }
        var ende = {
            hours: (new Date(activeFahrt.ende).getHours()==0)?("00"):((new Date(activeFahrt.ende).getHours()<10 && new Date(activeFahrt.ende).getHours()!=0)?("0"+new Date(activeFahrt.ende).getHours()):(new Date(activeFahrt.ende).getHours())),
            minutes: (new Date(activeFahrt.ende).getMinutes()==0)?("00"):((new Date(activeFahrt.ende).getMinutes()<10 && new Date(activeFahrt.ende).getMinutes()!=0)?("0"+new Date(activeFahrt.ende).getMinutes()):(new Date(activeFahrt.ende).getMinutes()))
        }
    }
    
    $scope.uhranfang = activeFahrt?(anfang.hours + ":" + anfang.minutes):null;
    $scope.uhrende = activeFahrt?(ende.hours + ":" + ende.minutes):null;
    $scope.kanfang = activeFahrt?parseFloat(activeFahrt.anfangskilometer):null;
    $scope.kmende = activeFahrt?parseFloat(activeFahrt.endkilometer):null;
    $scope.anfangsort = activeFahrt?activeFahrt.anfangsort:null;
    $scope.endort = activeFahrt?activeFahrt.endort:null;
    
    if (!activeFahrt) {
        //Anfangsort eintragen
        if (model.dataModel.getMitarbeiter().getLetzteStandort()) {
            $scope.anfangsort = model.dataModel.getMitarbeiter().getLetzteStandort();
        }
        
        if (model.dataModel.getMitarbeiter().getLetzteKilometer()) {
            $scope.kanfang = parseInt(model.dataModel.getMitarbeiter().getLetzteKilometer());
        }
    }
    
    
    //KFZ voreintragen
    if (activeFahrt) {
        $scope.kfz = activeFahrt.kfz
    }else{
        $scope.kfz = model.dataModel.getMitarbeiter().getStandKfz();
    }
   
    $scope.callSessiondetail = function(save) {
        if (save===false) {
            if (activeFahrt) {
            activeFahrtObj.setActive(false);
            }
            $state.go('sessiondetail');
            return;
        }
        
        var leis = document.getElementById("leistung");
        var leisId = leis.options[leis.selectedIndex].getAttribute('data-leistung-id');
        
        //ArbeitsId ermitteln
        if (!currentsession.getFahrten()){ //currentsession instanceof Session -> keine Suche im Array mehr notwendig
            var fahrtId = 0;
        } else {
            var fahrtId = currentsession.getFahrten().length; //currentsession instanceof Session -> keine Suche im Array mehr notwendig
        }
        
        var passt = FormvalidationService.validateFahrt();
        
        //Gesamtkilometer berechnen und falls <0 -> Fehler!
        var gesamtkilometer = parseInt(document.getElementById('kmende').value) - parseInt(document.getElementById('kanfang').value);
        if (gesamtkilometer<0) {
            var alertPopup = $ionicPopup.alert({
                title: "Fehler",
                template: "Gesamtkilometer sind kleiner 0!"
            })
            return;
        }
        
            var anfangsdatum = new Date(document.getElementById("anfangsdatum").value);
            var enddatum =  new Date(document.getElementById("enddatum").value);
            var anfangszeit = document.getElementById("timeA").value;
            var endzeit = document.getElementById("timeE").value;
            var beginn = TimeCalculatorService.createDateInMs(anfangsdatum, anfangszeit);
            var ende = TimeCalculatorService.createDateInMs(enddatum, endzeit);
            
            var anfangskilometer = document.getElementById("kanfang").value;
            var endkilometer = document.getElementById("kmende").value;
            var anfangsort = document.getElementById("anfangsort").value;
            var endort = document.getElementById("endort").value;
            var kfz = document.getElementById("kfz").value;
        
        var dauer = TimeCalculatorService.createDateObject(ende-beginn
                                                           );
        if (parseInt(dauer.hours)<0) {
            var alertPopup = $ionicPopup.alert({
                title:"Fehler",
                template: "Die Dauer der Fahrt ist kleiner 0!"
            })
            return
        }
        
        if (passt) {
            
            var tage = (dauer.days!=0)?(dauer.days + " Tage "):"";
            var beginndate = new Date(beginn);
            beginndate = beginndate.toString().substring(0,10);
            var enddate = new Date(ende);
            enddate = enddate.toString().substring(0,10);

            var dateMsg = (beginndate===enddate)?("am " + beginndate):("von " + beginndate + " bis " + enddate);
            
            var confirmPopup = $ionicPopup.confirm({
                title: 'Fahrtzeit hinzufügen',
                template: 'Folgende Fahrtzeiten werden erfasst: <br />' 
                            + leis.options[leistung.selectedIndex].text + ", von " + anfangsort + " bis " + endort
                            + '<br /> ' + dateMsg +
                            '<br />' +' von ' + anfangszeit +  ' bis '  + endzeit
                            + '<br />(' + gesamtkilometer + ' Kilometer, ' + tage + "" + dauer.hours + "h " + dauer.minutes + "min)" 
            });
            confirmPopup.then(function(res) {
                if(res) {
                    if (activeFahrt) {
                        activeFahrtObj.setAnfangskilometer(anfangskilometer);
                        activeFahrtObj.setEndkilometer(endkilometer);
                        activeFahrtObj.setAnfangsort(anfangsort);
                        activeFahrtObj.setEndort(endort);
                        //activeFahrtObj.setAnfangsdatum(anfangsdatum);
                        //activeFahrtObj.setEnddatum(enddatum);
                        //activeFahrtObj.setAnfangszeit(anfangszeit);
                        //activeFahrtObj.setEndzeit(endzeit);
                        activeFahrtObj.setBeginn(beginn);
                        activeFahrtObj.setEnde(ende);
                        activeFahrtObj.setLeistungsId(leisId);
                        activeFahrtObj.setKfz(kfz);
                        activeFahrtObj.setActive(false);
                    }else{
                        var fahrt = new Fahrt.create({
                        id: fahrtId,
                        //anfangsdatum: new Date(anfangsdatum),
                        //enddatum: new Date(enddatum),
                        //anfangszeit: anfangszeit,
                        //endzeit: endzeit,
                        beginn : beginn,
                        ende : ende,
                        anfangskilometer: anfangskilometer,
                        endkilometer: endkilometer,
                        anfangsort: anfangsort,
                        endort: endort,
                        kfz : kfz,
                        leistungsId: leisId
                        })
                        currentsession.addFahrt(fahrt); //currentsession instanceof Session -> keine Suche im Array mehr notwendig
                    }
                  /*fahrtssession freigeben und in sessionmanager wechseln*/
                    model.dataModel.getMitarbeiter().setLetzteStandort(endort);
                    model.dataModel.getMitarbeiter().setLetzteKilometer(document.getElementById('kmende').value);
                    DataModel.update(model.dataModel, true); //model im localstorage aktualisieren
                    $state.go('sessiondetail');
                } else {
                  /*Alles bleibt so wie es ist!*/
                }
            });
        } else {
            /*Alles bleibt so wie es ist!*/
        }   
    }
})

.controller('ListCtrl', function($scope, DataModel) {
    $scope.shouldShowDelete = false;
    $scope.data = {
        showDelete: false
    }
     
    $scope.sessions = model.dataModel.getSessionList(); //setzt die Sessions
    //datum auf angemessenes format zuschneiden
    for(var i=0,anz=$scope.sessions.length;i<anz;i++){
        var _ses = $scope.sessions[i];
        _ses.date = (_ses.beginn).toString().substring(0,10);
    }
    
    $scope.onItemDelete = function(sessionId) {
        var deleteIndex = undefined; //geklickter index finden
        for(var i=0,anz=$scope.sessions.length;i<anz;i++){
            var _ses = $scope.sessions[i];
            if (sessionId === _ses.id) {
                deleteIndex = i;
                break;
            }
        }
        $scope.sessions.splice(deleteIndex, 1); //aus dem array der sessions wird der ausgewaehlt, der geloescht werden soll
        model.dataModel.getSessionById(sessionId).setDeleted(true); //selbe session wird auf "deleted = true" gesetzt
        DataModel.update(model.dataModel, true); //speichern
    };
    
    
   
    for(var i=0,anz=$scope.sessions.length;i<anz;i++){
        //jeweils für die aktuelle session.client (welcher als ID angegeben ist) wird durch den vollen Namen des Clienten ersetzt
        $scope.sessions[i].client = model.dataModel.getClientById($scope.sessions[i].clientId).getFullName();
    }
   
})