
import ClientManager from "./ClientManager.js";
import GUIController from "./GUIController.js";
import { events, Events } from "./EventsController.js";


// events.on( events.connected, () => {
// 	console.log("eventcontroller", "client connected")
// })


const clientManager = new ClientManager( );

// clientManager.connect( );

const guiController = new GUIController()

window.connect = () => {clientManager.connect()}
window.disconnect = () => {clientManager.disconnect()}
window.requestNewInstance = ( name ) => {clientManager.requestNewInstance( name )}
window.requestJoinInstance = ( name ) => {clientManager.requestJoinInstance( name )}
window.requestLeaveInstance = ( name ) => {clientManager.requestLeaveInstance( name )}
window.requestFileRequest = ( name ) => {clientManager.requestFileRequest( name )}
window.loadFile = async ( fileName ) => { await clientManager.loadFile( "./Files", fileName )}