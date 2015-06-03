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
                    console.log('Ja');
                    model.dataModel.deleteActiveSession();//löscht aktive Session - keine offenen Sessions mehr
                    /*für sessionübersicht freigeben und in arbeitsübersicht wechseln*/
                    $state.go('arbeitsoberflaeche');
                } else {
                    console.log('Nein');
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
        /*Änderungen speichern?*/
        /*Sessiondetails hier drin wären nett*/
        var confirmPopup = $ionicPopup.confirm({
          title: 'Session Abschließen?',
          template: 'Möchtest du die Arbeits -und Fahrtzeiten zum hochladen freigeben?'
        });
        confirmPopup.then(function(res) {
          if(res) {
            console.log('Ja');
            model.dataModel.getActiveSession().setActive(false);
            /*für sessionübersicht freigeben und in arbeitsübersicht wechseln*/
            $state.go('arbeitsoberflaeche');
          } else {
            console.log('Nein');
            /*Alles bleibt so wie es ist!*/
          }
        });
    }
})

.controller('SessionuebersichtCtrl', function($scope, $state) {
    $scope.items = model.dataModel.getSessionList();
    //console.log($scope.items);
    
    $scope.callSessiondetail=function(sessionId){
        model.dataModel.getSessionById(sessionId).setActive(true);
        $state.go('sessiondetail');
    }
    $scope.callArbeitsoberflaeche = function() {
        $state.go('arbeitsoberflaeche');
    }
})

.controller('SessiondetailCtrl', function($scope, $state) {
    console.log(model.dataModel.getActiveSession().toJson());
    $scope.callSessionuebersicht = function() {
        $state.go('sessionuebersicht');
    }
    
    //$scope.items = [
    // { id: 0, name:'Max Mustermann', ort:'Völs', session: "Fahrt", leistung: "Hinfahrt"},
    // { id: 1, name:'Peter Oberhuber', ort:'Wörgl', session: "Arbeit", leistung: "Sauna"},
    // { id: 2, name:'Julia Sargnagel', ort:'Innsbruck', session:  "Fahrt", leistung: "Rückfahrt"},
    // { id: 3, name:'Anna Fenninger', ort:'Telfs', session: "Arbeit", leistung: "Schwimmen"}
    // ]
    
})

.controller('ArbeitsmanagerCtrl', function($scope, $state, Arbeit, $ionicPopup, FormvalidationService) {
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
                        + '<ul><li>Leistung: ' + leis.options[leis.selectedIndex].text
                        + ' </li><li>Dauer: von ' + document.getElementById("timeA").value
                        +  '  bis '  + document.getElementById("timeE").value
                        + ' (' + dauer + ' Stunden) </li></ul>'  //Arbeitsdaten!!! Geht das noch schöner?
                        
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
                  console.log('Nein');
                  /*Alles bleibt so wie es ist!*/
                }
            });
        } else {
            console.log('Nein');
            /*Alles bleibt so wie es ist!*/
        }
        
    }
})

.controller('FahrtenmanagerCtrl', function($scope, DataModel, Fahrt, $state, $ionicPopup, FormvalidationService) {
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
        //Routine auf gesamtkilometer < 0 !!!
        
        if (passt) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Fahrtzeit hinzufügen',
                template: 'Folgende Fahrtzeiten werden erfasst:\n' 
                           + '<ul><li>Leistung: ' + leis.options[leistung.selectedIndex].text
                            + ' </li><li>Dauer: von ' + document.getElementById("timeA").value
                            +  '  bis '  + document.getElementById("timeE").value
                            + ' (' + gesamtkilometer + ' Kilometer) </li></ul>' 
            });
            confirmPopup.then(function(res) {
                if(res) {
                  /*fahrtssession freigeben und in sessionmanager wechseln*/
                  
                  model.letzteFahrt = document.getElementById('endort').value;
                  
                  var fahrt = new Fahrt.create({
                        id: fahrtId,
                        datum: new Date(document.getElementById("datum").value),
                        anfangszeit: document.getElementById("timeA").value,
                        endzeit: document.getElementById("timeE").value,
                        anfangskilometer: document.getElementById('kanfang').value,
                        endkilometer: document.getElementById('kmende').value,
                        anfangsort: document.getElementById('anfangsort').value,
                        endort:  document.getElementById('endort').value,
                        leistungsId: leisId
                    })
                  currentsession.addFahrt(fahrt); //currentsession instanceof Session -> keine Suche im Array mehr notwendig
                 
                  $state.go('sessionmanager');
                } else {
                  console.log('Nein');
                  /*Alles bleibt so wie es ist!*/
                }
            });
        } else {
            console.log('Nein');
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
        $scope.sessions[i].client = model.dataModel.getClientById($scope.sessions[i].client).getFullName();
    }
   
})

.controller('ArbeitCtrl', function($scope, $state) {
 $scope.callSessiondetail = function() {
    $state.go('sessiondetail')
 }
})
 
 .controller('FahrtCtrl', function($scope, $state) {
 $scope.callSessiondetail = function() {
    $state.go('sessiondetail')
 }
 })

 
 /*testanfang*/

 /*testende*/

