angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $state, $filter, $ionicPopup) {
    $scope.clicked = false
    $scope.callSessionmanager = function() {
        
        if (document.getElementById('kunde').value=="") {
            $ionicPopup.alert ({
                title: "Kein Klient eingetragen!",
                template: "Bitte zuerst einen Klienten angeben"
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
        $scope.contacts = [
         { id: 0, name:'Max Mustermann', ort:'Völs', session: "Fahrt", leistung: "Hinfahrt"},
         { id: 1, name:'Peter Oberhuber', ort:'Wörgl', session: "Arbeit", leistung: "Sauna"},
         { id: 2, name:'Julia Sargnagel', ort:'Innsbruck', session:  "Fahrt", leistung: "Rückfahrt"},
         { id: 3, name:'Anna Fenninger', ort:'Telfs', session: "Arbeit", leistung: "Schwimmen"}
         ]
        $scope.queryData = $filter('filter')($scope.contacts, query);
    }
    
    $scope.updateInput = function (contact) {
        var d=document.getElementById('kunde');
        d.value=contact;
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

.controller('ArbeitsmanagerCtrl', function($scope, $state, $ionicPopup) {
    $scope.callSessionmanager = function() {
        $state.go('sessionmanager')
    }

    
    $scope.getCurrentStartTime = function() {
        var date=new Date()
        var hours = date.getHours();
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var time = hours + ":" + minutes + ":" + "00";
        
        $scope.anfangszeit = time;
        $scope.hideSpanA = true;
        document.getElementById("anfangszeit").value = time;
    }
    
    $scope.getCurrentEndTime = function() {
        var date=new Date()
        var hours = date.getHours();
        var minutes = date.getMinutes();
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        var time = hours + ":" + minutes + ":" + "00";
        
        $scope.endzeit = time;
        $scope.hideSpanE = true;
        document.getElementById("endzeit").value = time;
    }
    
    $scope.finishArbeit = function() {
        /*Routinen um Dateneingaben zu überprüfen hier rein, oder mit Verlinkung auf Service (<- besser)!*/
        /*Wenn Alles Passt*/
        var passt=true //testvariable
        
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

.controller('FahrtenmanagerCtrl', function($scope, $state, $ionicPopup) {
    $scope.callSessionmanager = function() {
        $state.go('sessionmanager')
    }
    
    $scope.finishFahrt = function() {
        /*Routinen um Dateneingaben zu überprüfen hier rein, oder mit Verlinkung auf Service (<- besser)!*/
        /*Wenn Alles Passt*/
        var passt=true //testvariable
        
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

