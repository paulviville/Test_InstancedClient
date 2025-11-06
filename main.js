
import ClientManager from "./ClientManager.js";

const clientManager = new ClientManager();

clientManager.connect();



window.connect = () => {clientManager.connect()}
window.disconnect = () => {clientManager.disconnect()}
window.requestNewInstance = ( name ) => {clientManager.requestNewInstance( name )}
window.requestJoinInstance = ( name ) => {clientManager.requestJoinInstance( name )}
window.requestLeaveInstance = ( name ) => {clientManager.requestLeaveInstance( name )}
window.requestFileRequest = ( name ) => {clientManager.requestFileRequest( name )}
window.loadFile = async ( ) => { await clientManager.loadFile( "./Files", "bath_day.glb" )}