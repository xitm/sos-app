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


.controller('LoginCtrl', function($scope, LoginService, $state) {
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
              var alertPopup = alert({
                  title: 'Login failed!',
                  template: 'Please check your credentials!'
                });
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
        $state.go('arbeitsmanager');
        
    }
    $scope.callFahrtenmanager = function() {
        $state.go('fahrtenmanager');
    }
    $scope.finishSession = function() {
        /*Routine um Daten zu checken und im model aktualisieren, danach werden Daten für Datenübersicht freigegeben*/
        DataModel.update(model.dataModel, true);
        
        //Wenn noch keine Session eingetragen ist, kann nichts abgeschlossen werden.
        if ((!currentsession.getFahrten()[0]) && !(currentsession.getArbeiten()[0])) {
            var alertPopup = $ionicPopup.alert({
                title: "Fehler",
                template: "Es wurde noch keine Session eingetragen"
            })
            return;
        }
        
        /*Änderungen speichern?*/
        /*Sessiondetails hier drin wären nett*/
        var confirmPopup = $ionicPopup.confirm({
          title: 'Session Abschließen?',
          template: 'Möchtest du die Arbeits -und Fahrtzeiten zum hochladen freigeben?'
        });
        confirmPopup.then(function(res) {
          if(res) {
            model.dataModel.getActiveSession().setActive(false);
            //Muss noch in localstorage geschrieben wreden!!
            $state.go('arbeitsoberflaeche');
          } else {
            /*Alles bleibt so wie es ist!*/
          }
        });
    }
})

.controller('SessionuebersichtCtrl', function($scope, $state) {
    $scope.items = model.dataModel.toJson().mitarbeiter.sessions
    
    //console.log($scope.items);
    
    $scope.callSessiondetail=function(sessionId){
        model.dataModel.getSessionById(sessionId).setActive(true);
        $state.go('sessiondetail');
    }
    $scope.callArbeitsoberflaeche = function() {
        $state.go('arbeitsoberflaeche');
    }
})

.controller('SessiondetailCtrl', function($scope, TimeCalculatorService, $state) {
    //console.log(model.dataModel.getActiveSession().toJson());
    $scope.activeSession = model.dataModel.getActiveSession(); //speichert aktive Session in den Scope
    //console.log($scope.activeSession.getArbeiten()[0].toJson());
    $scope.fahrten = $scope.activeSession.toJson().fahrten; //speichert die Fahrten extra ab, für den ng-repeat
    $scope.arbeiten = $scope.activeSession.toJson().arbeiten;//speichert die Arbeiten extra ab, für den ng-repeat
    //Zeit, die zwischen Anfang und Ende vergangen ist für jede Fahrt/Arbeit
    $scope.totalDiff = 0;
    for(var i=0,anz=$scope.fahrten.length;i<anz;i++){
        var _fa = $scope.fahrten[i];
        _fa.differenz = TimeCalculatorService.time(_fa.anfangszeit, _fa.endzeit);
        //PLAZT FÜR GESAMTUNERSCHIED LASSEN!!!!
        _fa.differenz = _fa.differenz['hours'] + " Stunden " + _fa.differenz['minutes'] + " Minuten";
    }
    for(var i=0,anz=$scope.arbeiten.length;i<anz;i++){
        var _ar = $scope.arbeiten[i];
        _ar.differenz = TimeCalculatorService.time(_ar.anfangszeit, _ar.endzeit);
        //PLAZT FÜR GESAMTUNERSCHIED LASSEN!!!!
        _ar.differenz = _ar.differenz['hours'] + " Stunden " + _ar.differenz['minutes'] + " Minuten";
    }
    
    $scope.callSessionuebersicht = function(sessionId){
        model.dataModel.getActiveSession().setActive(false);
        $state.go('sessionuebersicht');
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

.controller('ArbeitCtrl', function($scope, DataModel, $state) {
    $scope.activeArbeitObj = model.dataModel.getActiveArbeit(model.dataModel.getActiveSession());//aktive Arbeit der aktiven Session
    $scope.activeArbeit = $scope.activeArbeitObj.toJson();//aktive Arbeit der aktiven Session als JSON-Notation
    $scope.activeArbeit.date = new Date($scope.activeArbeitObj.getDatum());
    $scope.leistungen = model.dataModel.getLeistungList("arbeit");
    $scope.selected = {value : 0}
    
    
    //ausgewählte Leistung vordefinieren:
    for(var i=0,anz=$scope.leistungen.length;i<anz;i++){
        var _ls = $scope.leistungen[i];
        if (_ls.id === $scope.activeArbeit.leistungsId || _ls.id === parseInt($scope.activeArbeit.leistungsId)) {
            $scope.selected = {value : i};
        }
    }
    
    $scope.callSessiondetail = function(saveChanges) {
        if (saveChanges===true) {
            //Routinen, um die einzelen Änderungen zu erfassen!
            //Leistung
            var _ls = document.getElementById('leistungSelect');
            var _lsId = _ls.options[_ls.selectedIndex].getAttribute('data-leistung-id');
            //Datum
            var _date = new Date(document.getElementById('inputDate').value);
            //Zeiten
            var _timeA = document.getElementById('timeA').value;//Anfangszeit
            var _timeE = document.getElementById('timeE').value;//Endzeit
            
            //routinen, um Model zu aktualisieren
            var _aktArb = $scope.activeArbeitObj;
            _aktArb.setLeistungsId(_lsId);
            _aktArb.setDatum(_date);
            _aktArb.setAnfangszeit(_timeA);
            _aktArb.setEndzeit(_timeE);
            DataModel.update(model.dataModel, true);
        }
        
        $scope.activeArbeitObj.setActive(false);
        $state.go('sessiondetail')
    }
})
 
.controller('FahrtCtrl', function($scope, $state) {
    $scope.callSessiondetail = function() {
        model.dataModel.getActiveFahrt(model.dataModel.getActiveSession()).setActive(false);
        $state.go('sessiondetail')
    }
})


.controller('ArbeitsmanagerCtrl', function($scope, $state, Arbeit, $ionicPopup, FormvalidationService, TimeCalculatorService) {
    //aktuelle Session des Modells
    var currentsession = model.dataModel.getActiveSession();
    
    //Sessionmanager Aufrufen
    $scope.callSessionmanager = function() {
        $state.go('sessionmanager')
    }
    //Gespeichertes Datum voreintragen
    $scope.date = currentsession.getDatum(); //Da currentsession bereits instanceof Session -> keine Suche im Index mehr!

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
        var stunden = dauer[0];
        if (parseInt(stunden)<0) {
            var alertPopup = $ionicPopup.alert({
                title:"Fehler",
                template: "Die Dauer der Arbeit ist kleiner 0!"
            })
            return
        }
        var minuten = dauer[1];
        
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
                  $state.go('sessionmanager');
                } else {
                  
                  /*Alles bleibt so wie es ist!*/
                }
            });
        } else {
            /*Alles bleibt so wie es ist!*/
        }
        
    }
})

.controller('FahrtenmanagerCtrl', function($scope, DataModel, Fahrt, $state, $ionicPopup, FormvalidationService, TimeCalculatorService) {
    $scope.callSessionmanager = function() {
        $state.go('sessionmanager')
    }
    //aktuelle Session
    var currentsession = model.dataModel.getActiveSession();
    


    //Datum eintragen
    $scope.datum = currentsession.getDatum();
    //Anfangsort eintragen
    if (model.dataModel.getMitarbeiter().getLetzteFahrt()) {
        document.getElementById('anfangsort').value = model.dataModel.getMitarbeiter().getLetzteFahrt();
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
        var stunden = dauer[0];
        if (parseInt(stunden)<0) {
            var alertPopup = $ionicPopup.alert({
                title:"Fehler",
                template: "Die Dauer der Fahrt ist kleiner 0!"
            })
            return
        }
        var minuten = dauer[1];
        
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
                  model.letzteFahrt = document.getElementById('endort').value;
                  
                  var fahrt = new Fahrt.create({
                        id: fahrtId,
                        datum: new Date(datum),
                        anfangszeit: anfangszeit,
                        endzeit: endzeit,
                        anfangskilometer: document.getElementById('kanfang').value,
                        endkilometer: document.getElementById('kmende').value,
                        anfangsort: endort,
                        endort:  anfangsort,
                        leistungsId: leisId
                    })
                  currentsession.addFahrt(fahrt); //currentsession instanceof Session -> keine Suche im Array mehr notwendig
                 
                  $state.go('sessionmanager');
                } else {
                  /*Alles bleibt so wie es ist!*/
                }
            });
        } else {
            /*Alles bleibt so wie es ist!*/
        }   
    }
})

.controller('ListCtrl', function($scope) {
    $scope.shouldShowDelete = false;
    $scope.data = {
      showDelete: false
     }
    $scope.onItemDelete = function(item) {
      $scope.items.splice($scope.items.indexOf(item), 1);
     };
    
    $scope.sessions = model.dataModel.getSessionList(); //setzt die Sessions
   
    for(var i=0,anz=$scope.sessions.length;i<anz;i++){
        //jeweils für die aktuelle session.client (welcher als ID angegeben ist) wird durch den vollen Namen des Clienten ersetzt
        $scope.sessions[i].client = model.dataModel.getClientById($scope.sessions[i].clientId).getFullName();
    }
   
})