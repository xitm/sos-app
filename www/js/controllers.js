angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, DataModel, Session, $state, $filter, $ionicPopup) {
    $scope.clicked = false;
    $scope.dataModel = DataModel;
    $scope.date = new Date;
    $scope.callSessionmanager = function() {
        
        //$scope.date in model speichern
        //Session anlegen!

        var clients = $scope.dataModel.getClienten();
        var check = false;
        
        for(var i=0,anz=clients.length;i<anz;i++){
            if(document.getElementById('kunde').value === (clients[i].getVorname() + ' ' + clients[i].getNachname())){
                
                document.getElementById('kunde').setAttribute('data-id', clients[i].getId());
                check = true;
            }
        }
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
                template: "Bitte einen Klienten gültigen angeben"
            })
            return;
        }
        
        $state.go('sessionmanager')
    }
    $scope.callSessionuebersicht = function() {
        $state.go('sessionuebersicht')
    }
    
    $scope.searchContacts = function(query) {
        $scope.clicked = false
        $scope.contacts = $scope.dataModel.getClientList();
        $scope.queryData = $filter('filter')($scope.contacts, query);
    }
    
    $scope.updateInput = function (contact) {
        var d=document.getElementById('kunde');
        d.value=contact.vorname + ' ' + contact.nachname;
        d.setAttribute('data-id', contact.id);
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

.controller('SessionmanagerCtrl', function($scope, $state, $ionicPopup) {
    $scope.callArbeitsoberflaeche = function() {
        $state.go('arbeitsoberflaeche');
    }
    $scope.callArbeitsmanager = function() {
        $state.go('arbeitsmanager');
    }
    $scope.callFahrtenmanager = function() {
        $state.go('fahrtenmanager');
    }
    $scope.finishSession = function() {
        /*Routine um Daten zu checken und im model aktualisieren, danach werden Daten für Datenübersicht freigegeben*/
        
        /*Änderungen speichern?*/
        /*Sessiondetails hier drin wären nett*/
        var confirmPopup = $ionicPopup.confirm({
          title: 'Session Abschließen?',
          template: 'Möchtest du die Arbeits -und Fahrtzeiten zum hochladen freigeben?'
        });
        confirmPopup.then(function(res) {
          if(res) {
            console.log('Ja');
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
    $scope.callArbeitsoberflaeche = function() {
        $state.go('arbeitsoberflaeche');
    }
})

.controller('SessiondetailCtrl', function($scope, $state) {
    $scope.callSessionuebersicht = function() {
        $state.go('sessionuebersicht');
    }
    
    $scope.items = [
     { id: 0, name:'Max Mustermann', ort:'Völs', session: "Fahrt", leistung: "Hinfahrt"},
     { id: 1, name:'Peter Oberhuber', ort:'Wörgl', session: "Arbeit", leistung: "Sauna"},
     { id: 2, name:'Julia Sargnagel', ort:'Innsbruck', session:  "Fahrt", leistung: "Rückfahrt"},
     { id: 3, name:'Anna Fenninger', ort:'Telfs', session: "Arbeit", leistung: "Schwimmen"}
     ]
    
})

.controller('ArbeitsmanagerCtrl', function($scope, DataModel, $state, $ionicPopup) {
    $scope.callSessionmanager = function() {
        $state.go('sessionmanager')
    }
    $scope.dataModel = DataModel;
    $scope.leistungen = $scope.dataModel.getLeistungList('arbeit');
    $scope.updateDataId = function(){
        var leistung = document.getElementById("leistung");
        var leistung_name = leistung.options[leistung.selectedIndex].getAttribute('data-id');
        console.log(leistung_name);
        //document.getElementById('leistung').setAttribute('data-id', leistung.id);
    }
    //ANMERKUNG: eine function, anderes ELEMENT mitgeben!
    
    $scope.finishArbeit = function() {
        /*Routinen um Dateneingaben zu überprüfen hier rein, oder mit Verlinkung auf Service (<- besser)!*/
        /*Wenn Alles Passt*/
        var passt=false; //testvariable
        var sel = document.getElementById("leistung");
        var lsId = sel.options[sel.selectedIndex].getAttribute('data-id');
        
        console.log(lsId);
        if (passt) {
            
            var confirmPopup = $ionicPopup.confirm({
                title: 'Arbeitszeit hinzufügen',
                template: 'Folgende Arbeitsdaten werden erfasst:' //+Arbeitsdaten!!!
            });
            confirmPopup.then(function(res) {
                if(res) {
                  console.log('Ja');
                  /*für sessionübersicht freigeben und in arbeitsübersicht wechseln*/
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

.controller('FahrtenmanagerCtrl', function($scope, DataModel, $state, $ionicPopup) {
    $scope.callSessionmanager = function() {
        $state.go('sessionmanager')
    }
    
    $scope.dataModel = DataModel;
    $scope.leistungen = DataModel.getLeistungList('fahrt');
    $scope.updateDataId = function(leistung){
        document.getElementById('leistung').setAttribute('data-id', leistung.id);
        document.getElementById('leistung').getAttribute('data-id');
    }
    
   
    $scope.finishFahrt = function() {
        /*Routinen um Dateneingaben zu überprüfen hier rein, oder mit Verlinkung auf Service (<- besser)!*/
        /*Wenn Alles Passt*/
        var passt=true //testvariable
        console.log(document.getElementById('leistung').value);
        if (passt) {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Fahrtzeit hinzufügen',
                template: 'Folgende Fahrtzeiten werden erfasst:' //+Arbeitsdaten!!!
            });
            confirmPopup.then(function(res) {
                if(res) {
                  console.log('Ja');
                  /*für sessionübersicht freigeben und in arbeitsübersicht wechseln*/
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
    
    
    $scope.items = [
     { id: 0, name:'Max Mustermann', ort:'Völs' },
     { id: 1, name:'Peter Oberhuber', ort:'Wörgl'  },
     { id: 2, name:'Julia Sargnagel', ort:'Innsbruck'  },
     { id: 3, name:'Anna Fenninger', ort:'Telfs'  }
     ]
   
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

