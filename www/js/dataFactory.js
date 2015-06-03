angular.module('starter.services', [])
.service('LoginService', function($q) {
    return {
        loginUser: function(pw) {
            var deferred = $q.defer();
            var promise = deferred.promise;
 
            if ( pw == '1234') {
                deferred.resolve('Welcome ' + ' Alex' + '!');
            } else {
                deferred.reject('Wrong credentials.');
            }
            promise.success = function(fn) {
                promise.then(fn);
                return promise;
            }
            promise.error = function(fn) {
                promise.then(null, fn);
                return promise;
            }
            return promise;
        }
    }
})
/*-----------Arbeiten noch zu erledigen:-----------/
 *-------1. Klassendefinitionen mit Argumenten befüllen/
 *-------2. Argumente automatisch mit this.setXx festlegen/
 *-------3. JSON-Struktur umwandeln und jeweils eigens instanzieren/
 *-------4. alle Prototype-functions!-------------------------------/+
 *-------5. fromJson -function zum Erstellen des Models ausgehend der JSON-Structur in ALLEN Klassen implementieren!!---/
 *-------5. alle addXx-functionen so weiterentwickeln, dass auch gleich mehrere Unterobjekte (Sessions, Fahrten, etc.) entgegengenommen werdern können! ---*/
.factory('AppError', function(){
    AppError = function(message, functionName, objectName, attachment){
        this.name = name || "AppError";
        this.message = message || "Unbekannter Fehler";
        this.functionName = functionName || "Unbekannt";
        this.objectName = objectName || "Unbekannt";
        this.attachment = attachment || "Unbekannt";
    }
    
    AppError.prototype = Error.prototype;
    
    AppError.prototype.toString = function(){
        return this.message + "\nFunktion: " + this.functionName +
        "\nObjekt: " + this.objectName + "\nTyp uebergebenes Object: " + this.attachment;
    }
    
    AppError.create = function(JSONstructure){
        var err = new AppError(JSONstructure.msg, JSONstructure.fnc, JSONstructure.object, JSONstructure.type);
        return err;
    }
    return(AppError);
})


//----------- 1. - BusinessObject_Class_Definition------//
.factory('BusinessObject',function(Mitarbeiter, Leistung, Client, AppError){
    function BusinessObject(){
        var ERR_MSG ={
            TYPE_ERR_MA : "Objektfehler; Mitarbeiter erwartet!",
            TYPE_ERR_LS : "Objektfehler; Leistung erwartet!",
            TYPE_ERR_CS : "Objektfehler; Client erwartet!",
            TYPE_ERR_PIN : "Objektfehler; string erwartet!",
            LENGTH_ERR_PIN : "Dimensionsfehler: string mit Laenge 4 erwartet!"
            
        };
        var _mitarbeiter = undefined;
        var _pin = undefined;
        var _leistungen = new Array();
        var _clienten = new Array();

        
        //1.1 mitarbeiter_definitionen
        this.setMitarbeiter = function(mitarbeiter) {
            if (!(mitarbeiter instanceof Mitarbeiter)) {
                throw new AppError(ERR_MSG.TYPE_ERR_MA, 'setMitarbeiter', 'BusinessObject', typeof mitarbeiter).toString();
            }
            _mitarbeiter = mitarbeiter;
        }
        this.getMitarbeiter = function() {
            return _mitarbeiter;
        }
        
        //1.2 leistung_definitionen
        this.addLeistung = function(leistung) {
            if (!(leistung instanceof Leistung)) {
                throw new AppError(ERR_MSG.TYPE_ERR_LS, 'addLeistung', 'BusinessObject', typeof leistung).toString();
            }
            _leistungen.push(leistung);
        }
        this.getLeistungen = function() {
            return _leistungen;
        }
        
        //1.3 client_definitionen
        this.addClient = function(client) {
            if (!(client instanceof Client)) {
                throw new AppError(ERR_MSG.TYPE_ERR_CL, 'addClient', 'BusinessObject', typeof client).toString();
            }
            _clienten.push(client);
        }
        this.getClienten = function() {
            return _clienten;
        }
        
        //1.4 pin_definitionen
        this.setPin = function(pin) {
            if (typeof pin != 'string') {
                throw new AppError(ERR_MSG.TYPE_ERR_PIN, 'setPin', 'BusinessObject', typeof pin).toString();
            }
            if (pin.length != 4) {
                throw new AppError(ERR_MSG.LENGTH_ERR_PIN, 'setPin', 'BusinessObject', pin.length).toString();
            }
            _pin = pin;
        }
        this.getPin = function() {
            return _pin;
        }
        
    }
    
    //1.z1 Prototype functions
    
    //returns aktive Session!
    BusinessObject.prototype.getActiveSession = function(){
        var _sessions = this.getMitarbeiter().getSessions(); //alle sessions
        for(var i=0,anz=_sessions.length;i<anz;i++){
            var _ses = _sessions[i]; //caching Session der aktuellen Iteration
            if (_ses.getActive()) {//wenn active==true
                return _ses;
            }
        }
    }
    
    //löscht die aktuell offene Session aus dem Array für Sessions!
    BusinessObject.prototype.deleteActiveSession = function(){
        var _sessions = this.getMitarbeiter().getSessions(); //alle Sessions
        for (var i=0,anz=_sessions.length;i<anz;i++) {
            var _ses = _sessions[i];//caching Session der aktuellen Iteration
            if (_ses.getActive()) { //wenn active==true
                _sessions.splice(i,1);//löscht an der Stelle i genau das nachfolgende (also selbe) 1 Objekt
                return
            }
        }
        
    }
    
    BusinessObject.prototype.getClientList = function(){
        var _clienten = this.getClienten();
        var _clientList = new Array();
        for(var i=0, anz=_clienten.length;i<anz;i++){
            _clientList.push(_clienten[i].toJson());
        }
        return _clientList;
    }
    
    BusinessObject.prototype.getLeistungList = function(typ){
        var _leistungen;
        var _lsList = new Array()
        if (typ) {
            _leistungen = this.getLeistungByTyp(typ);
        }else{
            _leistungen = this.getLeistungen();
        }
        for(var i=0, anz=_leistungen.length;i<anz;i++){
            _lsList.push(_leistungen[i].toJson());
        }
        
        return _lsList;
    }
    
    BusinessObject.prototype.getClientById=function(id){
        var _clients = this.getClienten();
        for(var i=0, anz=_clients.length;i<anz;i++){
            if (_clients[i].getId()===id) {
                return _clients[i];
            }
        }
        return //ERROR OBJECT NO CLIENT FOUND
    }
    
    BusinessObject.prototype.getLeistungById=function(id){
        var _leistungen = this.getLeistungen();
        for(var i=0, anz=_leistung.length;i<anz;i++){
            if (_leistungen[i].getId()===id) {
                return _leistungen[i];
            }
        }
        return //ERROR OBJECT NO LEISTUNG FOUND
    }
    
    BusinessObject.prototype.getLeistungByTyp = function(typ){
        var _leistungen = this.getLeistungen();
        var _resLs = new Array();
        for(var i=0, anz=_leistungen.length;i<anz;i++){
            if (_leistungen[i].getTyp()===typ) {
                _resLs.push(_leistungen[i]);
            }
        }
        return _resLs;
    }
    
    BusinessObject.prototype.toJson = function(){
        //Array für Clienten
        var _clients = this.getClienten();
        //leerer Resultatsarray für JSON von Clienten
        var _clRes = [];
        for(var i=0,anz=_clients.length;i<anz;i++){
            var _cl = _clients[i]; //client an der jeweiligen Stelle des Arrays, welches i entspricht
            _clRes.push(_cl.toJson()); //Json wird in den Resultatsarray gepushed
        }
        
        //Array für Leistungen
        var _leistungen = this.getLeistungen();
        //leerer Resultatsarray für JSON von Leistungen
        var _lsRes = [];
        for(var i=0,anz=_leistungen.length;i<anz;i++){
            var _ls = _leistungen[i]; //leistungen an der jeweiligen Stelle des Arrays, welches i entspricht
            _lsRes.push(_ls.toJson()); //Json wird in den Resultatsarray gepushed
        }
        
        return {
            mitarbeiter : this.getMitarbeiter().toJson(),
            pin : this.getPin(),
            leistungen : _lsRes,
            clienten : _clRes
        };
    }
    
    //1.Zusatz Create_option
    BusinessObject.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        
        
        //Ausgabe des fertigen BuisnessObjects
        var ba = new BusinessObject(/*hier kommen evtl die ausgearbeiteten Variablen hinein!*/);
        ba.setPin('1234');
        var ma = new Mitarbeiter.create(JSONstructure.mitarbeiter);
        
        ba.setMitarbeiter(ma);
        
        //ba.setMitarbeiter("asdfasdf");
        for(var i = 0, anz=JSONstructure.clienten.length; i<anz; i++){
            var cl = new Client.create(JSONstructure.clienten[i]);
            ba.addClient(cl);
        }

        for(var i=0, anz=JSONstructure.leistungen.length;i<anz;i++){
            var ls = new Leistung.create(JSONstructure.leistungen[i]);
            ba.addLeistung(ls);
        }
        //zusätzliche Sessions usw adden!
        return(
            ba
        )
    }
    return(BusinessObject);
    
})

//----------- 2. - Mitarbeiter_Class_Definition------//
.factory('Mitarbeiter', function(Session){
    
    function Mitarbeiter(id, vorname, nachname, adresse, kfz, letzteFahrt){
        var ERR_MSG ={
            TYPE_ERR_VN : "Typenfehler: string für Vornamen erwartet!",
            TYPE_ERR_NN : "Typenfehler: string für Nachnamen erwartet!",
            TYPE_ERR_SES : "Typenfehler: object Session erwartet!"
        };
        
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
        this.getId = function() {
            return _id;
        }
        
        //2.2 vorname_definitionen
        this.setVorname = function(vorname) {
            if (typeof vorname != "string") {
                throw new AppError(ERR_MSG.TYPE_ERR_VN, 'setVorname', 'Mitarbeiter', typeof vorname);
            }
            _vorname = vorname;
        }
        this.getVorname = function() {
            return _vorname;
        }
        
        //2.3 nachname_definitionen
        this.setNachname = function(nachname) {
            if (typeof vorname != "string") {
                throw new AppError(ERR_MSG.TYPE_ERR_NN, 'setNachname', 'Mitarbeiter', typeof nachname);
            }
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
            if (!(session instanceof Session)) {
                throw new AppError(ERR_MSG.TYPE_ERR_SES, 'addSession', 'Mitarbeiter', typeof session);
            }
            _sessions.push(session);
        }
        this.getSessions = function() {
            return _sessions;
        }
        
        //2.7 letzteFahrt_definitionen
        this.setLetzteFahrt = function(letzteFahrt) {
            _letzteFahrt = letzteFahrt;
        }
        this.getLetzteFahrt = function() {
            return _letzteFahrt;
        }
        
        this.setId(id);
        this.setVorname(vorname);
        this.setNachname(nachname);
        this.setAdresse(adresse);
        this.setStandKfz(kfz);
        this.setLetzteFahrt(letzteFahrt);
    }
    
    Mitarbeiter.prototype.toJson = function(){
        var _sessions = this.getSessions(); //get all the Sessions
        var _sesRes = []; //leerer Result-Array für Resultate
        for(var i=0,anz=_sessions.length;i<anz;i++){
            var _ses = _sessions[i]; //caching der aktuellen Session
            _sesRes.push(_ses.toJson());
        }
        
        return {
            id : this.getId(),
            vorname : this.getVorname(),
            nachname : this.getNachname(),
            adresse : this.getAdresse(),
            kfz : this.getStandKfz(),
            sessions : _sesRes
        }
    }
    
    //2.Zusatz Create_option
    Mitarbeiter.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        //SESSIONS erstellen!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        
        //Ausgabe des fertigen Mitarbeiters
        var ma = new Mitarbeiter(JSONstructure.id, JSONstructure.vorname, JSONstructure.nachname, JSONstructure.adresse, JSONstructure.kfz, JSONstructure.letzteFahrt);
        //zusätzliche Sessions usw adden!
        return(
            ma
        )
    }
    
    return(Mitarbeiter);
})

//----------- 3. - Leistung_Class_Definition------//
.factory('Leistung', function(){
    
    function Leistung(id, name, typ){
        var _id = undefined;
        var _name = undefined;
        var _typ = undefined;
        
        //3.1 leistungsId_definitionen
        this.setId = function(leistungsId) {
            _id = leistungsId;
        }
        this.getId = function() {
            return _id;
        }
        
        //3.2 leistungsName_definitionen
        this.setName = function(leistungsName) {
            _name = leistungsName;
        }
        this.getName = function() {
            return _name;
        }
        
        //3.3 leistungsTyp_definitionen
        this.setTyp = function(leistungsTyp) {
            _typ = leistungsTyp;
        }
        this.getTyp = function() {
            return _typ;
        }
        this.setId(id);
        this.setName(name);
        this.setTyp(typ);
    }
    
    //3. z1 Prototype functions
    Leistung.prototype.toJson = function(){
        return {
            id : this.getId(),
            name : this.getName(),
            typ : this.getTyp()
        }
    }
    
    //3.Zusatz Create_option
    Leistung.create = function(JSONstructure){
        //Methoden zur Aufbereitung des JSON-Strings
        
        
        //Ausgabe des fertigen Mitarbeiters
        var ls = new Leistung(JSONstructure.id, JSONstructure.name, JSONstructure.typ);
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
        var cl = new Client(JSONstructure.id, JSONstructure.vorname, JSONstructure.nachname, JSONstructure.ort);
        return(
            cl
        )
    }
    
    return(Client);
})

//----------- 6. - Session_Class_Definition------//
.factory('Session', function(){
    
    function Session(id, datum, clientId){
        var _id = undefined;
        var _datum = undefined;
        var _clientId = undefined;
        var _fahrten= new Array();
        var _arbeiten = new Array();
        var _deleted = false;
        var _active = false;
        
        
        //5.1 sessionId_definitionen
        this.setId = function(sessionId) {
            _id = sessionId;
        }
        this.getId = function() {
            return _id;
        }
        
        
        //5.2 sessionDatum_definitionen
        this.setDatum = function(sessionDatum) {
            _datum = sessionDatum;
        }
        this.getDatum = function() {
            return _datum;
        }
        
        //5.3 client_definitionen
        this.setClientId = function(clientId) {
            _clientId = clientId;
        }
        this.getClientId = function() {
            return _clientId;
        }
        
        //5.4 fahrten_definitionen
        this.addFahrt = function(fahrt){
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
        //5.6 set/get active
        this.setActive = function(active) {
            _active = active;
        }
        this.getActive = function() {
            return _active;
        }
        
        this.setId(id); //Errorhandling!
        this.setDatum(datum);
        this.setClientId(clientId); //change from this.setClient(client); to this.setClientId(clientId);
        
    }
    
    Session.prototype.toJson = function(){
        var _arbeiten = this.getArbeiten(); //arbeiten werden ausgelesen
        var _arRes = []; //leerer Arbeitenarray
        for(var i=0,anz=_arbeiten.length;i<anz;i++){
            _ar = _arbeiten[i];//caching der aktuellen Arbeit
            _arRes.push(_ar.toJson());//fügt das JSON der aktuellen Arbeit hinzu
        }
        
        var _fahrten = this.getFahrten(); //fahrten werden ausgelesen
        var _faRes = []; //leerer FAhrtenarray
        for(var i=0,anz=_fahrten.length;i<anz;i++){
            _fa = _fahrten[i];//caching der aktuellen Arbeit
            _faRes.push(_fa.toJson());//fügt das JSON der aktuellen Arbeit hinzu
        }
        
        return {
            id : this.getId(),
            datum : this.getDatum(),
            client : this.getClientId(),
            fahrten : _faRes,
            arbeiten : _arRes
        }
    }
    
    Session.create = function(JSONstructure){

        var ses = new Session(JSONstructure.id, JSONstructure.datum, JSONstructure.clientId);
        //zusätzliche Sessions usw adden!
        return(
            ses
        )
    }
    
    return(Session);
})

//----------- 6. - Fahrt_Class_Definition------//
.factory('Fahrt', function(){
    function Fahrt(id,datum,anfangszeit,endzeit,anfangskilometer,endkilometer,anfangsort,endort,leistung) {
        var _id = undefined;
        var _datum = undefined;
        var _anfangszeit = undefined;
        var _endzeit = undefined;
        var _anfangskilometer = undefined;
        var _endkilometer = undefined;
        var _anfangsort = undefined;
        var _endort = undefined;
        var _leistung = undefined;
        var _letzteFahrt = undefined;
        
        //6.1 fahrtId_definition
        this.setId = function(arbeitsId) {
            _id= arbeitsId;
        }
        this.getId = function() {
            return _id;
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
        
        
        

        this.setId(id);
        this.setDatum(datum);
        this.setAnfangszeit(anfangszeit);
        this.setEndzeit(endzeit);
        this.setAnfangskilometer(anfangskilometer);
        this.setEndkilometer(endkilometer);
        this.setAnfangsort(anfangsort);
        this.setEndort(endort);
        this.setLeistung(leistung);
        
    }
    
    Fahrt.prototype.toJson = function(){
        return {
            id : this.getId(),
            datum : this.getDatum(),
            anfangszeit : this.getAnfangszeit(),
            endzeit : this.getEndzeit(),
            anfangskilometer : this.getAnfangskilometer(),
            endkilomenter : this.getEndkilometer(),
            anfangsort : this.getAnfangsort(),
            endort : this.getEndort(),
            leistung : this.getLeistung()
        }
    }
    
    Fahrt.create = function(JSONstructure){

        var fa = new Fahrt(JSONstructure.id,JSONstructure.datum,JSONstructure.anfangszeit,JSONstructure.endzeit,JSONstructure.anfangskilometer,JSONstructure.endkilometer,JSONstructure.anfangsort,JSONstructure.endort,JSONstructure.leistung);
        return(
            fa
        )
    }
    
    return(Fahrt);
})
//----------- 7. - Arbeit_Class_Definition------//
.factory('Arbeit', function(){
    function Arbeit(id, datum, anfangszeit, endzeit, leistung) {
        var _id = undefined;
        var _datum = undefined;
        var _anfangszeit = undefined;
        var _endzeit = undefined;
        var _leistung = undefined; //ID????
        
        //7.1 arbeitsId_definitionen
        this.setId = function(arbeitsId) {
            _id= arbeitsId;
        }
        this.getId = function() {
            return _id;
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
        
        this.setId(id);
        this.setDatum(datum);
        this.setAnfangszeit(anfangszeit);
        this.setEndzeit(endzeit);
        this.setLeistung(leistung);
    }
    
    Arbeit.prototype.toJson = function(){
        return {
            id : this.getId(),
            datum : this.getDatum(),
            anfangszeit : this.getAnfangszeit(),
            endzeit : this.getEndzeit(),
            leistung : this.getLeistung()
        }
    }
    
    Arbeit.create = function(JSONstructure){
        
        var ar = new Arbeit(JSONstructure.id, JSONstructure.datum, JSONstructure.anfangszeit,JSONstructure.endzeit);
        return(
            ar
        )
    }
    return(Arbeit);
})

//Zusammenführen aller Model-Funktionen in einem Service
.service('DataModel', function(BusinessObject){
    this.create = function(){
        return BusinessObject.create(JSON.parse(localStorage.getItem('mle_model')));
    };
    this.update = function(objectBusinessObject, save){
        var res = objectBusinessObject.toJson();
        if (save) {
            localStorage.setItem('mle_model2', JSON.stringify(res));
        }
        return res;
    }
})
