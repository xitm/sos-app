angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, DataModel, Session, $state, $filter, $ionicPopup) {
    $scope.clicked = false;
    model.dataModel = DataModel.create(); //Anpassung an neue Service-Gestaltung
    $scope.date = new Date();
    
    $scope.callSessionmanager = function() {
        //clients für Auswahllisten
        var clients = model.dataModel.getClienten();
        
        //client für ausgewählten Kunden
        var client = document.getElementById('kunde')
        var check = false;
        
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
        
        //Sessionmanager aufrufen
        $state.go('sessionmanager')
        
        //SessionId vergeben
        if (!model.dataModel.getMitarbeiter().getSessions()){
            var sessionid = 0;
        } else {
            var sessionid = model.dataModel.getMitarbeiter().getSessions().length 
        }
        //Routine, das im localstorage zu speicher fehlt noch! --> damit das App auch geschlossen und wieder geöffnet werden kann.
        
        /*------------------*/
        //Session erstellen
        var session = new Session.create(
            {id: sessionid,
            datum: new Date(document.getElementById("datum").value), //Datum vom Auswahlfeld
            clientId: client.getAttribute('data-id')//clientId
            }
        )
        //Setactive von Session
        session.setActive(true); //Routine erstellen die setActives überprüft!!!!
        
        //Session hinzufügen
        model.dataModel.getMitarbeiter().addSession(session)
    }
    $scope.callSessionuebersicht = function() {
        $state.go('sessionuebersicht')
    }
    
    $scope.searchContacts = function(query) {
        $scope.clicked = false
        $scope.contacts = model.dataModel.getClientList();
        $scope.queryData = $filter('filter')($scope.contacts, query);
    }
    
    $scope.updateInput = function (contact) {
        var kunde=document.getElementById('kunde');
        kunde.value=contact.vorname + ' ' + contact.nachname;
        kunde.setAttribute('data-id', contact.id);
        $scope.clicked = true;
    }
})


.controller('LoginCtrl', function($scope, LoginService, $state, $ionicPopup) {
    $scope.init = function() {
      $scope.passcode = "";
    }
    $scope.add = function(value) {
      if($scope.passcode.length < 4) {
        $scope.passcode = $scope.passcode + value;
        if($scope.passcode.length == 4) {
            LoginService.loginUser($scope.passcode).success(function(data) {
                $state.go('arbeitsoberflaeche')
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
            //Akutelle Session noch löschen!!
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
        /*Routine um Daten zu checken und im model aktualisieren, danach werden Daten für Datenübersicht freigegeben*/
        DataModel.update(model.dataModel, true);//model im local storage aktualisieren
        
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
          template: 'Möchtest du die Arbeits -ugend Fahrtzeiten zum hochladen freigeben?'
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

.controller('SessionuebersichtCtrl', function($scope, $state) {

    
    $scope.callSessiondetail=function(sessionId){
        model.dataModel.getSessionById(sessionId).setActive(true);
        $state.go('sessiondetail');
    }
    $scope.callArbeitsoberflaeche = function() {
        $state.go('arbeitsoberflaeche');
    }
})

.controller('SessiondetailCtrl', function($scope, TimeCalculatorService, $state, DataModel, $ionicPopup) {
    $scope.activeSession = model.dataModel.getActiveSession(); //speichert aktive Session in den Scope
    $scope.fahrten = $scope.activeSession.toJson().fahrten; //speichert die Fahrten extra ab, für den ng-repeat
    $scope.arbeiten = $scope.activeSession.toJson().arbeiten;//speichert die Arbeiten extra ab, für den ng-repeat
    //Zeit, die zwischen Anfang und Ende vergangen ist für jede Fahrt/Arbeit
    //$scope.arbeiten.leistung =
    for (var i=0,anz=model.dataModel.getLeistungen().length;i<anz;i++) {
        var _ls = model.dataModel.getLeistungen()[i];
        if ($scope.arbeiten.leistungsid === _ls.getId()) {
           $scope.arbeiten.leistung = _ls.getName();
           return;
        }
    }
    
    $scope.date = $scope.activeSession.toJson().datum;
    $scope.totalDiffTime = {hours : 0, minutes : 0};
    $scope.totalDiffRoute = 0;
    
    $scope.client = model.dataModel.getClientById($scope.activeSession.getClientId()).getFullName();
    
    
    
    //Falls keine Arbeits -oder Zeiteinheiten vorhanden sind. Textmeldung auf true setzen
    $scope.emptywork = false;
    $scope.emptytrip = false;
    if ($scope.arbeiten.length==0) {
        console.log($scope.arbeiten.length);
        $scope.emptywork = true;
    }
    if ($scope.fahrten.length == 0) {
        $scope.emptytrip = true;
    }
    
    for(var i=0,anz=$scope.fahrten.length;i<anz;i++){
        var _fa = $scope.fahrten[i];
        _fa.differenz = TimeCalculatorService.time(_fa.anfangszeit, _fa.endzeit);
        
        addToTotalTime(_fa.differenz); //differenz dazuzaehlen
        $scope.totalDiffRoute += parseFloat(_fa.endkilometer)-parseFloat(_fa.anfangskilometer); //zur gesamten Streckendifferenz dazuzaehlen
        _fa.differenz = _fa.differenz.hours + " Stunden " + _fa.differenz.minutes + " Minuten"; //ausgabe zurechtschneiden
    }
    
    for(var i=0,anz=$scope.arbeiten.length;i<anz;i++){
        var _ar = $scope.arbeiten[i];
        _ar.differenz = TimeCalculatorService.time(_ar.anfangszeit, _ar.endzeit);
        addToTotalTime(_ar.differenz); //zur gesamten Dauer hinzufuegen
        _ar.differenz = _ar.differenz.hours + " Stunden " + _ar.differenz.minutes + " Minuten"; //ausgabe zurechtstueckeln
        
        var leistungsId= parseInt(_ar.leistungsId);
        $scope.arbeiten[i].leistung=model.dataModel.getLeistungById(leistungsId).getName();
    }
    
    function addToTotalTime(time){ //funktion erstellt, da sie 2 mal gebraucht wird!
        var _hours = parseInt(time.hours);
        var _mins = parseInt(time.minutes);
        
        
        $scope.totalDiffTime.hours += _hours;
        $scope.totalDiffTime.minutes += _mins;
        
        if ($scope.totalDiffTime.minutes>60) { //wenn ueber 60 minuten, wieder anpassen!
            $scope.totalDiffTime.minutes=$scope.totalDiffTime.minutes - 60;
            $scope.totalDiffTime.hours++;
        }
    }
    
    $scope.data = {
        showArbeit: false,
        showFahrt: false
    };
  
    $scope.checkDelete= function (change, $event) {
        if ($scope.data.showArbeit==true && change=="hideArbeit") {
            $scope.data.showArbeit=false;
        }else if ($scope.data.showFahrt==true && change=="hideFahrt"){
            $scope.data.showFahrt= false;
        }else if (change=="fahrt" || change=="arbeit") {
            if (change == "arbeit") {
                $scope.data = {showArbeit:true,
                               showFahrt:false};
            } else {
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
        if (typ == "arbeit") {
            for(var i=0,anz=$scope.arbeiten.length;i<anz;i++){
                var _ar = $scope.arbeiten[i];
                if (id === _ar.id) {
                    deleteIndex = i;
                    break;
                }
            }
            
            $scope.arbeiten.splice(deleteIndex,1); //aus der Ansicht im Fenster loeschen - Grund: JSON zu loeschen hat auf Model keine direkte Auswirkung! umgekehrt aktualisiert sich die Ansicht nicht sofort (erst bei neuem Laden), wenn aus dem Model etwas geloescht wird
            model.dataModel.getActiveSession().getArbeiten().splice(deleteIndex, 1); //aus dem array der sessions wird der ausgewaehlt, der geloescht werden soll
            //model.dataModel.getSessionById(sessionId).setDeleted(true); //selbe session wird auf "deleted = true" gesetzt
            DataModel.update(model.dataModel, true); //speichern//Geht noch nichT!!!!
            
             if (!($scope.arbeiten[0])) {
                $scope.emptywork=true;
            }
            
        } else if (typ == "fahrt") {
            for(var i=0,anz=$scope.fahrten.length;i<anz;i++){
                var _fa = $scope.fahrten[i];
                if (id === _fa.id) {
                    deleteIndex = i;
                    break;
                }
            }
            $scope.fahrten.splice(deleteIndex, 1);  //aus der Ansicht im Fenster loeschen - Grund: JSON zu loeschen hat auf Model keine direkte Auswirkung!
                                                    //umgekehrt aktualisiert sich die Ansicht nicht sofort (erst bei neuem Laden), wenn aus dem Model etwas geloescht wird
            model.dataModel.getActiveSession().getFahrten().splice(deleteIndex, 1);//aus dem array der sessions wird der ausgewaehlt, der geloescht werden soll
            //model.dataModel.getSessionById(sessionId).setDeleted(true); //selbe session wird auf "deleted = true" gesetzt
            DataModel.update(model.dataModel, true); //speichern //Geht noch nichT!!!!
            
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
        if (!(model.dataModel.getActiveSession().getFahrten()[0]) && !(model.dataModel.getActiveSession().getArbeiten()[0])) {
            var confirmPopup = $ionicPopup.confirm({
                title: "Keine Einheiten vorhanden",
                template: "In dieser Session sind keine Arbeits -und Fahrteinheiten mehr vorhanden, bei OK wird diese Session gelöscht"
            })
            confirmPopup.then(function(res) {
                    if(res) {
                        var id= model.dataModel.getActiveSession().toJson().id; //SessionId
                        model.dataModel.getSessionList().splice(id, 1); //aus dem array der sessions wird der ausgewaehlt, der geloescht werden soll
                        model.dataModel.getSessionById(id).setDeleted(true); //selbe session wird auf "deleted = true" gesetzt
                        DataModel.update(model.dataModel, true); //speichern
                        $state.go('sessionuebersicht');
                    } else {
                      /*Alles bleibt so wie es ist!*/
                    }
                });
        } else {
            model.dataModel.getActiveSession().setActive(false);
            $state.go('sessionuebersicht');
        }
        
    }
    
    $scope.callSessionbearbeitungFahrt = function(fahrtId){
        $scope.activeSession.getFahrtById(fahrtId).setActive(true);
        $state.go('sessionbearbeitungFahrt');
    }
    
    $scope.callSessionbearbeitungArbeit = function(arbeitsId){
        $scope.activeSession.getArbeitById(arbeitsId).setActive(true);
        $state.go('sessionbearbeitungArbeit');
    }
})

.controller('ArbeitCtrl', function($scope, DataModel, $state, $ionicPopup, FormvalidationService, TimeCalculatorService) {
    $scope.activeArbeitObj = model.dataModel.getActiveArbeit(model.dataModel.getActiveSession());//aktive Arbeit der aktiven Session
    $scope.activeArbeit = $scope.activeArbeitObj.toJson();//aktive Arbeit der aktiven Session als JSON-Notation
    $scope.uhranfang = $scope.activeArbeit.anfangszeit;
    $scope.uhrende = $scope.activeArbeit.endzeit;
    $scope.activeArbeit.date = new Date($scope.activeArbeitObj.getDatum());
    $scope.leistungen = model.dataModel.getLeistungList("arbeit"); //leistungen der arbeiten werden geladen (fuer select)
    $scope.selected = {value : 0} //var fuer die vorselectierte leistung
    
    
    //ausgewählte Leistung pre-selecten:
    for(var i=0,anz=$scope.leistungen.length;i<anz;i++){
        var _ls = $scope.leistungen[i];
        if (_ls.id === $scope.activeArbeit.leistungsId || _ls.id === parseInt($scope.activeArbeit.leistungsId)) {
            $scope.selected = {value : i};
        }
    }
    
    $scope.callSessiondetail = function(saveChanges) {//eine funktion -> wurde auf speichern geklickt oder auf zurueck?
        if (saveChanges===true) {
            //Routinen, um die einzelen Änderungen zu erfassen!
            //Leistung
            var _ls = document.getElementById('leistung');
            var _lsId = _ls.options[_ls.selectedIndex].getAttribute('data-leistung-id');
            //Datum
            var _date = new Date(document.getElementById('datum').value);
            //Zeiten
            var _timeA = document.getElementById('timeA').value;//Anfangszeit
            var _timeE = document.getElementById('timeE').value;//Endzeit
            
            var currentsession = model.dataModel.getActiveSession(); //active Session speichern
            
            var passt = FormvalidationService.validateArbeit(true);
        
            //Testvariable abfragen
            if (passt) {
                var dauer = TimeCalculatorService.time(_timeA, _timeE);
                console.log(dauer);
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Arbeitszeit ändern',
                    template: 'Folgende Arbeitsdaten werden erfasst: <br/>'
                            + _ls.options[_ls.selectedIndex].text + " am " + _date
                            + ' von ' + _timeA +  '  bis '  + _timeE
                            + ' (' + dauer.hours + 'h ' + dauer.minutes+ 'min)' 
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        //setzer der neuen Eigenschaften
                        var _aktArb = $scope.activeArbeitObj;
                        _aktArb.setLeistungsId(_lsId);
                        _aktArb.setDatum(_date);
                        _aktArb.setAnfangszeit(_timeA);
                        _aktArb.setEndzeit(_timeE);

                        DataModel.update(model.dataModel, true);//model im local storage aktualisieren
                    } else {
                      
                      /*Alles bleibt so wie es ist!*/
                    }
                });
            } else {
                /*Alles bleibt so wie es ist!*/
            };
        } else {
            $scope.activeArbeitObj.setActive(false);//aktive Arbeit abwählen
            $state.go('sessiondetail'); //zum Sessiondetail navigieren
        }
    }
})
 
.controller('FahrtCtrl', function($scope, DataModel, $state, $ionicPopup, FormvalidationService, TimeCalculatorService) {
    $scope.activeFahrtObj = model.dataModel.getActiveFahrt(model.dataModel.getActiveSession());//aktive Arbeit der aktiven Session
    $scope.activeFahrt = $scope.activeFahrtObj.toJson();//aktive Arbeit der aktiven Session als JSON-Notation
    $scope.activeFahrt.date = new Date($scope.activeFahrtObj.getDatum());
    
    $scope.uhranfang = $scope.activeFahrt.anfangszeit;
    $scope.uhrende = $scope.activeFahrt.endzeit;
    
    $scope.leistungen = model.dataModel.getLeistungList("fahrt"); //leistungen der fahrten laden
    $scope.selected = {value : 0} //value fuer die ausgewaehlte leistung
    $scope.kfz = model.dataModel.getMitarbeiter().getStandKfz();//Standard-Kfz des Mitarbeiters erhalten!

    //ausgewählte Leistung vordefinieren:
    for(var i=0,anz=$scope.leistungen.length;i<anz;i++){//die leistung der fahrt wird pre-selected!
        var _ls = $scope.leistungen[i];
        if (_ls.id === $scope.activeFahrt.leistungsId || _ls.id === parseInt($scope.activeFahrt.leistungsId)) {
            $scope.selected = {value : i};
        }
    }
    
    
    
    $scope.callSessiondetail = function(save) {//aufteilen, damit nicht 2 idente funktionen erstellt werden muessen
        if (save===true) {//dies wird nur durchlaufen, wenn true mitgegeben wurde - also wenn gespeichert wird (OK-Button)!
            var passt = FormvalidationService.validateFahrt(true);
            if (passt) {
                var _ls = document.getElementById('leistung');
                var gesamtkilometer = document.getElementById('kmende').value - document.getElementById('kanfang').value;
                var dauer = TimeCalculatorService.time(document.getElementById('timeA').value, document.getElementById('timeE').value);
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Fahrtzeit hinzufügen',
                    template: 'Folgende Fahrtzeiten werden erfasst: <br />' 
                                + _ls.options[_ls.selectedIndex].text + " von " + document.getElementById('anfangsort').value + " bis " + document.getElementById('endort').value
                                + ' am ' + document.getElementById('datum').value + ' von ' + document.getElementById('timeA').value +  ' bis '  + document.getElementById('timeE').value
                                + ' (' + gesamtkilometer + ' Kilometer, ' + dauer.hours + "h " + dauer.minutes+ "min)" 
                });
                confirmPopup.then(function(res) {
                    if(res) {
                        /*fahrtssession freigeben und in sessionmanager wechseln*/
                        model.letzteFahrt = document.getElementById('endort').value;
                        
                        //Routinen, um Aenderungen zu speichern
                        var _ls = document.getElementById('leistung');
                        $scope.activeFahrtObj.setDatum(new Date(document.getElementById('datum').value));
                        $scope.activeFahrtObj.setAnfangszeit(document.getElementById('timeA').value);
                        $scope.activeFahrtObj.setEndzeit(document.getElementById('timeE').value);
                        $scope.activeFahrtObj.setAnfangskilometer(document.getElementById('kanfang').value);
                        $scope.activeFahrtObj.setEndkilometer(document.getElementById('kmende').value);
                        $scope.activeFahrtObj.setAnfangsort(document.getElementById('anfangsort').value);
                        $scope.activeFahrtObj.setEndort(document.getElementById('endort').value)
                        $scope.activeFahrtObj.setLeistungsId(_ls.options[_ls.selectedIndex].getAttribute('data-leistung-id'));
                        model.dataModel.getMitarbeiter().setLetzteStandort(document.getElementById('endort').value);
                        model.dataModel.getMitarbeiter().setLetzteKilometer(document.getElementById('kmende').value);
                        DataModel.update(model.dataModel, true);
                        DataModel.update(model.dataModel, true); //model im localstorage aktualisieren
                        $scope.activeFahrtObj.setActive(false);
                        $state.go('sessiondetail');
                    } else {
                      /*Alles bleibt so wie es ist!*/
                    }
                });
            } else {
                //Passiert hier was?
            }
        } else {
            $scope.activeFahrtObj.setActive(false);
            $state.go('sessiondetail');
        }
    }
})

.controller('ArbeitsmanagerCtrl', function($scope, $state, Arbeit, DataModel, $ionicPopup, FormvalidationService, TimeCalculatorService, $stateParams) {
    //aktuelle Session des Modells
    var currentsession = model.dataModel.getActiveSession();
    
    //Sessionmanager Aufrufen
    $scope.back = function() {
        if ($stateParams.sessionmanager == true) {
            $state.go('sessionmanager');
         } else {
            $state.go('sessiondetail');
         }
    }
    //Gespeichertes Datum voreintragen
    $scope.date = new Date(currentsession.getDatum()); //Da currentsession bereits instanceof Session -> keine Suche im Index mehr!

    $scope.leistungen = model.dataModel.getLeistungList('arbeit');
    //ANMERKUNG: eine function, anderes ELEMENT mitgeben!
    
    $scope.finishArbeit = function() {
        /*Routinen um Dateneingaben zu überprüfen hier rein, oder mit Verlinkung auf Service (<- besser)!*/
        /*Wenn Alles Passt*/
        var passt=true; //testvariable
        
        var leis = document.getElementById("leistung");
        var leisId = leis.options[leis.selectedIndex].getAttribute('data-id');
        
        var start = document.getElementById("timeA").value;
        var ende = document.getElementById("timeE").value;
        var dauer = TimeCalculatorService.time(start, ende);
        var stunden = dauer.hours;
        if (parseInt(stunden)<0) {
            var alertPopup = $ionicPopup.alert({
                title:"Fehler",
                template: "Die Dauer der Arbeit ist kleiner 0!"
            })
            return
        }
        var minuten = dauer.minutes;
        
        //Fehlerbehandlung, zuerst CSS wieder normal machen
        passt = FormvalidationService.validateArbeit(passt);
        
        
        //ArbeitsId ermitteln
        if (!currentsession.getArbeiten()){ //currentsession instanceof Session -> keine Suche im Array mehr notwendig
            var arbeitsId = 0
        } else {
            var arbeitsId = currentsession.getArbeiten().length; //currentsession instanceof Session -> keine Suche im Array mehr notwendig
        }
        
        //Testvariable abfragen
        if (passt) {
            var dauer = document.getElementById("timeA").value - document.getElementById("timeE").value;
            var confirmPopup = $ionicPopup.confirm({
                title: 'Arbeitszeit hinzufügen',
                template: 'Folgende Arbeitsdaten werden erfasst: <br/>'
                        + leis.options[leis.selectedIndex].text + " am " + document.getElementById("datum").value 
                        + ' von ' + start +  '  bis '  + ende
                        + ' (' + stunden + 'h ' + minuten + 'min)'  //Arbeitsdaten!!! Geht das noch schöner?
                        
            });
            confirmPopup.then(function(res) {
                if(res) {
                    
                  /*arbeitssession freigeben und in sessionmanager wechseln*/
                  var arbeit = new Arbeit.create({
                        id: arbeitsId,
                        datum: new Date(document.getElementById("datum").value),
                        anfangszeit: document.getElementById("timeA").value,
                        endzeit: document.getElementById("timeE").value,
                        leistungsId : leisId
                    })
                  currentsession.addArbeit(arbeit); //currentsession instanceof Session -> keine Suche im Array mehr notwendig
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
    
    $scope.callSessionmanager = function() {
        $state.go('sessionmanager')
    }
    //aktuelle Session
    var currentsession = model.dataModel.getActiveSession();
    
    $scope.back = function() {
        if ($stateParams.sessionmanager == true) {
            $state.go('sessionmanager');
         } else {
            $state.go('sessiondetail');
         }
    }

    //Datum eintragen
    $scope.datum = new Date(currentsession.getDatum());
    //Anfangsort eintragen
    if (model.dataModel.getMitarbeiter().getLetzteStandort()) {
        document.getElementById('anfangsort').value = model.dataModel.getMitarbeiter().getLetzteStandort();
    }
    if (model.dataModel.getMitarbeiter().getLetzteKilometer()) {
        $scope.kanfang = parseInt(model.dataModel.getMitarbeiter().getLetzteKilometer());
    }
    
    
    //Leistungen Laden
    $scope.leistungen = model.dataModel.getLeistungList('fahrt');
    
    //KFZ voreintragen
    $scope.kfz = model.dataModel.getMitarbeiter().getStandKfz();
    
    //Letzt eingetragenen Standort holen. Könnte man als Variable im Model speichern und dann in
    //localstorage schreiben, oder überhaupt glleich in localstorage schreiben
   
    $scope.finishFahrt = function() {
        /*Routinen um Dateneingaben zu überprüfen hier rein, oder mit Verlinkung auf Service (<- besser)!*/
        /*Wenn Alles Passt*/
        var passt=true //testvariable
        
        var leis = document.getElementById("leistung");
        var leisId = leis.options[leis.selectedIndex].getAttribute('data-id');
        
        //ArbeitsId ermitteln
        if (!currentsession.getFahrten()){ //currentsession instanceof Session -> keine Suche im Array mehr notwendig
            var fahrtId = 0
        } else {
            var fahrtId = currentsession.getFahrten().length; //currentsession instanceof Session -> keine Suche im Array mehr notwendig
        }
        
        passt = FormvalidationService.validateFahrt(passt);
        
        
        
        var gesamtkilometer = parseInt(document.getElementById('kmende').value) - parseInt(document.getElementById('kanfang').value);
        if (gesamtkilometer<0) {
            var alertPopup = $ionicPopup.alert({
                title: "Fehler",
                template: "Gesamtkilometer sind kleiner 0!"
            })
            return;
        }
        //Routine auf gesamtkilometer < 0 !!!
        
        var anfangsort = document.getElementById('anfangsort').value;
        var endort = document.getElementById('endort').value;
        var datum = document.getElementById("datum").value;
        var anfangszeit = document.getElementById("timeA").value;
        var endzeit = document.getElementById("timeE").value;
        
        var dauer = TimeCalculatorService.time(anfangszeit, endzeit);
        var stunden = dauer.hours;
        if (parseInt(stunden)<0) {
            var alertPopup = $ionicPopup.alert({
                title:"Fehler",
                template: "Die Dauer der Fahrt ist kleiner 0!"
            })
            return
        }
        var minuten = dauer.minutes;
        
        if (passt) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Fahrtzeit hinzufügen',
                template: 'Folgende Fahrtzeiten werden erfasst: <br />' 
                            + leis.options[leistung.selectedIndex].text + " von " + anfangsort + " bis " + endort
                            + ' am ' + datum + ' von ' + anfangszeit +  ' bis '  + endzeit
                            + ' (' + gesamtkilometer + ' Kilometer, ' + stunden + "h " + minuten + "min)" 
            });
            confirmPopup.then(function(res) {
                if(res) {
                  /*fahrtssession freigeben und in sessionmanager wechseln*/
                  
                  var fahrt = new Fahrt.create({
                        id: fahrtId,
                        datum: new Date(datum),
                        anfangszeit: anfangszeit,
                        endzeit: endzeit,
                        anfangskilometer: document.getElementById('kanfang').value,
                        endkilometer: document.getElementById('kmende').value,
                        anfangsort: anfangsort,
                        endort: endort,
                        leistungsId: leisId
                    })
                  
                  currentsession.addFahrt(fahrt); //currentsession instanceof Session -> keine Suche im Array mehr notwendig
                  
                 model.dataModel.getMitarbeiter().setLetzteStandort(endort);
                 model.dataModel.getMitarbeiter().setLetzteKilometer(document.getElementById('kmende').value);
                 DataModel.update(model.dataModel, true); //model im localstorage aktualisieren
                 //Routine zu prüfen ob Sessionmanager oder Sessiondetail
                 
                 console.log($stateParams)
                 console.log($stateParams.sessionmanager)
                 
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

.controller('ListCtrl', function($scope, DataModel) {
    $scope.shouldShowDelete = false;
    $scope.data = {
        showDelete: false
    }
     
    $scope.sessions = model.dataModel.getSessionList(); //setzt die Sessions
    //datum auf angemessenes format zuschneiden
    for(var i=0,anz=$scope.sessions.length;i<anz;i++){
        var _ses = $scope.sessions[i];
        _ses.date = _ses.datum.substr(0,10);
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