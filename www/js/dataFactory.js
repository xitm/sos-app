angular.module('starter.services', [])

/*-----------Arbeiten noch zu erledigen:-----------/
 *-------1. Klassendefinitionen mit Argumenten befüllen/
 *-------2. Argumente automatisch mit this.setXx festlegen/
 *-------3. JSON-Struktur umwandeln und jeweils eigens instanzieren/
 *-------4. alle Prototype-functions!-------------------------------*/

//----------- 1. - BusinessObject_Class_Definition------//
.factory('BusinessObject',function(Mitarbeiter, Leistung, Client){
    
    function BusinessObject(){
        var _mitarbeiter = undefined;
        var _pin = undefined;
        var _leistungen = new Array();
        var _clienten = new Array();
        
        //1.1 mitarbeiter_definitionen
        this.setMitarbeiter = function(mitarbeiter) {
            _mitarbeiter = mitarbeiter;
        }
        this.getMitarbeiter = function() {
            return _mitarbeiter;
        }
        
        //1.2 leistung_definitionen
        this.addLeistung = function(leistung) {
            _leistungen.push(leistung);
        }
        this.getLeistung = function() {
            return _leistungen;
        }
        
        //1.3 client_definitionen
        this.addClient = function(client) {
            _clienten.push(client);
        }
        this.getClienten = function() {
            return _clienten;
        }
        
        //1.4 pin_definitionen
        this.setPin = function(pin) {
            _pin = pin;
        }
        this.getPin = function() {
            return _pin;
        }
        
    }
    
    //1.z1 Prototype functions  
    BusinessObject.prototype.getClientList = function(){
        var _clientList = new Array();
        for(var i=0, anz=this.getClienten().length;i<anz;i++){
            _clientList.push(this.getClienten()[i].toJson());
        }
        
        return _clientList;
    }
    
    //1.Zusatz Create_option
    BusinessObject.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        
        
        //Ausgabe des fertigen BuisnessObjects
        var ba = new BusinessObject(/*hier kommen evtl die ausgearbeiteten Variablen hinein!*/);
        ba.setPin('1234');
        var ma = new Mitarbeiter.create(JSONstructure.mitarbeiter);
        ba.setMitarbeiter(ma);
        for(var i = 0, anz=JSONstructure.clienten.length; i<anz; i++){
            var cl = new Client.create(JSONstructure.clienten[i]);
            ba.addClient(cl);
        }
        //zusätzliche Sessions usw adden!
        return(
            ba
        )
    }
    return(BusinessObject);
    
})

//----------- 2. - Mitarbeiter_Class_Definition------//
.factory('Mitarbeiter', function(){
    function Mitarbeiter(id, vorname, nachname, adresse, kfz){
        var _id = undefined;
        var _vorname = undefined;
        var _nachname = undefined;
        var _adresse = undefined;
        var _standKfz = undefined;
        var _sessions = new Array();
        
        //2.1 personId_definitionen
        this.setId = function(id) {
            _id = id;
        }
        this.getPersonId = function() {
            return _id;
        }
        
        //2.2 vorname_definitionen
        this.setVorname = function(vorname) {
            _vorname = vorname;
        }
        this.getVorname = function() {
            return _vorname;
        }
        
        //2.3 nachname_definitionen
        this.setNachname = function(nachname) {
            _nachname = nachname;
        }
        this.getNachname = function() {
            return _nachname;
        }
        
        //2.4 adresse_definitionen
        this.setAdresse = function(adresse) {
            _adresse = adresse;
        }
        this.getAdresse = function() {
            return _adresse;
        }
        
        //2.5 standKfz_definitionen
        this.setStandKfz = function(standKfz) {
            _standKfz = standKfz;
        }
        this.getStandKfz = function() {
            return _standKfz;
        }
        
        //2.6 session_definitionen
        this.addSession = function(session) {
            _sessions.push(session);
        }
        this.getSessions = function() {
            return _sessions;
        }
        
        this.setId(id);
        this.setVorname(vorname);
        this.setNachname(nachname);
        this.setAdresse(adresse);
        this.setStandKfz(kfz);
    }
    
    //2.Zusatz Create_option
    Mitarbeiter.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        //SESSIONS erstellen!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        
        //Ausgabe des fertigen Mitarbeiters
        var ma = new Mitarbeiter(JSONstructure.id, JSONstructure.vorname, JSONstructure.nachname, JSONstructure.kfz);
        //zusätzliche Sessions usw adden!
        return(
            ma
        )
    }
    
    return(Mitarbeiter);
})

//----------- 3. - Leistung_Class_Definition------//
.factory('Leistung', function(){
    
    function Leistung(){
        var _leistungsId = undefined;
        var _leistungsName = undefined;
        var _leistungsTyp = undefined;
        
        //3.1 leistungsId_definitionen
        this.setLeistungsId = function(leistungsId) {
            _leistungsId = leistungsId;
        }
        this.getLeistungsId = function() {
            return _leistungsId;
        }
        
        //3.2 leistungsName_definitionen
        this.setLeistungsName = function(leistungsName) {
            _leistungsName = leistungsName;
        }
        this.getLeistungsName = function() {
            return _leistungsName;
        }
        
        //3.3 leistungsTyp_definitionen
        this.setLeistungsTyp = function(leistungsTyp) {
            _leistungsTyp = leistungsTyp;
        }
        this.getLeistungsTyp = function() {
            return _leistungsTyp;
        }
    }
    
    
    //3.Zusatz Create_option
    Leistung.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        
        
        //Ausgabe des fertigen Mitarbeiters
        var ls = new Leistung(/*hier kommen evtl die ausgearbeiteten Variablen hinein!*/);
        ls.setLeistungsName('adsfasdfas');
        //zusätzliche Sessions usw adden!
        return(
            ls
        )
    }
    
    return(Leistung);
    
})

//----------- 4. - Client_Class_Definition------//
.factory('Client', function(){
    
    function Client(id, vorname, nachname, adresse){
        var _id = undefined;
        var _vorname = undefined;
        var _nachname = undefined;
        var _adresse = undefined;
        
        //4.1 personId_definitionen
        this.setId = function(id) {
            _id = id;
        }
        this.getId = function() {
            return _id;
        }
        
        //4.2 vorname_definitionen
        this.setVorname = function(vorname) {
            _vorname = vorname;
        }
        this.getVorname = function() {
            return _vorname;
        }
        
        //4.3 nachname_definitionen
        this.setNachname = function(nachname) {
            _nachname = nachname;
        }
        this.getNachname = function() {
            return _nachname;
        }
        
        //4.4 adresse_definitionen
        this.setAdresse = function(adresse) {
            _adresse = adresse;
        }
        this.getAdresse = function() {
            return _adresse;
        }
        this.setId(id);
        this.setVorname(vorname);
        this.setNachname(nachname);
        this.setAdresse(adresse);
    }

    //4. z1 Prototype functions
    Client.prototype.toJson= function(){
        return {
            id: this.getId(),
            vorname: this.getVorname(),
            nachname: this.getNachname(),
            adresse : this.getAdresse(),
        }
    }
    
    //4.Zusatz Create_option
    Client.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        
        //Ausgabe des fertigen Mitarbeiters
        var cl = new Client(JSONstructure.id, JSONstructure.vorname, JSONstructure.nachname, JSONstructure.ort);
        return(
            cl
        )
    }
    
    return(Client);
})

//----------- 6. - Session_Class_Definition------//
.factory('Session', function(){
    
    function Session(){
        var _sessionId = undefined;
        var _sessionDatum = new Date();
        var _client = undefined;
        var _fahrten = new Array();
        var _arbeiten = new Array();
        var _deleted = false;
        var _active = false;
        
        
        //5.1 sessionId_definitionen
        this.setSessionId = function(sessionId) {
            _sessionId = sessionId;
        }
        this.getSessionId = function() {
            return _sessionId;
        }
        
        
        //5.2 sessionDatum_definitionen
        this.setSessionDatum = function(sessionDatum) {
            _sessionDatum = sessionDatum;
        }
        this.getSessionDatum = function() {
            return _sessionDatum;
        }
        
        //5.3 client_definitionen
        this.setClient = function(client) {
            _client = client;
        }
        this.getClient = function() {
            return _client;
        }
        
        //5.4 fahrten_definitionen
        this.addFahrten = function(fahrt){
            _fahrten.push(fahrt);
        }
        this.getFahrten = function(){
            return _fahrten;
        }
        
        //5.5 arbeiten_definitionen
        this.addArbeit = function(arbeit){
            _arbeiten.push(arbeit);
        }
        this.getArbeiten = function(){
            return _arbeiten;
        }
    }
    
    Session.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        
        
        //Ausgabe des fertigen Mitarbeiters
        var ses = new Session(/*hier kommen evtl die ausgearbeiteten Variablen hinein!*/);
        ses.setClient('Ranalter0');
        //zusätzliche Sessions usw adden!
        return(
            ses
        )
    }
    
    return(Session);
})

//----------- 6. - Fahrt_Class_Definition------//
.factory('Fahrt', function(){
    function Fahrt() {
        var _fahrtId = undefined;
        var _datum = undefined;
        var _anfangszeit = undefined;
        var _endzeit = undefined;
        var _anfangskilometer = undefined;
        var _endkilometer = undefined;
        var _anfangsort = undefined;
        var _endort = undefined;
        var _leistung = undefined;
        
        //6.1 fahrtId_definition
        this.setArbeitsId = function(arbeitsId) {
            _arbeitsId = arbeitsId;
        }
        this.getArbeitsId = function() {
            return _arbeitsId;
        }
        
        //6.2 datum_definitionen
        this.setDatum = function(datum) {
            _datum = datum;
        }
        this.getDatum = function() {
            return _datum;
        }
        
        //6.3 anfangszeit_definitionen
        this.setAnfangszeit = function(anfangszeit) {
            _anfangszeit = anfangszeit;
        }
        this.getAnfangszeit = function() {
            return _anfangszeit;
        }
        
        //6.4 endzeit_definitionen
        this.setEndzeit = function(endzeit) {
            _endzeit = endzeit;
        }
        this.getEndzeit = function() {
            return _endzeit;
        }
        
        //6.5 anfangskilometer_definitionen
        this.setAnfangskilometer = function(anfangskilometer) {
            _anfangskilometer = anfangskilometer;
        }
        this.getAnfangskilometer = function() {
            return _anfangskilometer;
        }
        
        //6.6 endkilometer_definitionen
        this.setEndkilometer = function(endkilometer) {
            _endkilometer = endkilometer;
        }
        this.getEndkilometer = function() {
            return _endkilometer;
        }
        
        //6.7 anfangsort
        this.setAnfangsort = function(anfangsort) {
            _anfangsort = anfangsort;
        }
        this.getAnfangsort = function() {
            return _anfangsort;
        }
        
        //6.8 endort
        this.setEndort = function(endort) {
            _endort = endort;
        }
        this.getEndort = function() {
            return _endort;
        }
        
        //6.9 leistung_definitionen
        this.setLeistung = function(leistung) {
            _leistung = leistung;
        }
        this.getLeistung = function() {
            return _leistung;
        }
    }
    
    Fahrt.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        
        
        //Ausgabe des fertigen Mitarbeiters
        var fa = new Session(/*hier kommen evtl die ausgearbeiteten Variablen hinein!*/);
        fa.setAnfangsort('Ranalter0');
        //zusätzliche Sessions usw adden!
        return(
            ar
        )
    }
    
    return(Fahrt);
})
//----------- 7. - Arbeit_Class_Definition------//
.factory('Arbeit', function(){
    function Arbeit() {
        var _arbeitsId = undefined;
        var _datum = undefined;
        var _anfangszeit = undefined;
        var _endzeit = undefined;
        var _leistung = undefined;
        
        //7.1 arbeitsId_definitionen
        this.setArbeitsId = function(arbeitsId) {
            _arbeitsId = arbeitsId;
        }
        this.getArbeitsId = function() {
            return _arbeitsId;
        }
        
        //7.2 datum_definitionen
        this.setDatum = function(datum) {
            _datum = datum;
        }
        this.getDatum = function() {
            return _datum;
        }
        
        //7.3 anfangszeit_definitionen
        this.setAnfangszeit = function(anfangszeit) {
            _anfangszeit = anfangszeit;
        }
        this.getAnfangszeit = function() {
            return _anfangszeit;
        }
        
        //7.4 endzeit_definitionen
        this.setEndzeit = function(endzeit) {
            _endzeit = endzeit;
        }
        this.getEndzeit = function() {
            return _endzeit;
        }
        
        //7.5 leistung_definitionen
        this.setLeistung = function(leistung) {
            _leistung = leistung;
        }
        this.getLeistung = function() {
            return _leistung;
        }
    }
    
    Arbeit.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        
        
        //Ausgabe des fertigen Mitarbeiters
        var ar = new Session(/*hier kommen evtl die ausgearbeiteten Variablen hinein!*/);
        ar.setAnfangszeit('Ranalter0');
        //zusätzliche Sessions usw adden!
        return(
            ar
        )
    }
    
    return(Arbeit);
})