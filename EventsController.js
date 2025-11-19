export class EventsController extends EventTarget {

	constructor ( ) {
        console.log( `EventsController - constructor` );
		
		super( );
	}

	on ( eventName, callback ) {
        console.log( `EventsController - on ${ eventName }` );

		this.addEventListener( eventName, event => {
			callback( event.detail )
		});
	}

	// remove ( eventName ) {
    //     console.log( `EventsController - remove ${ eventName }` );
		
	// }

	emit ( eventName, detail = {} ) {
        console.log( `EventsController - emit ${ eventName }` );
		// console.log(new CustomEvent( eventName, { detail }))
		if ( eventName !== undefined )
			this.dispatchEvent( new CustomEvent( eventName, { detail }));
	}


}

export const events = new EventsController( );
export class Events {
	static socketConnect = "socketConnect";
	static socketDisconnect = "socketDisconnect";
	static socketOpened = "socketOpened";
	static socketClosed = "socketClosed";
	static socketError = "socketError";

	static fileList = "fileList";
	static fileRequest = "fileRequest";
	static fileDownload = "fileDownload";
	static fileUpload = "fileUpload";

	static instanceList = "instanceList";
	static instanceNew = "instanceNew"
	static instanceJoin = "instanceJoin"
	static instanceLeave = "instanceLeave"
	static instanceFileLoad = "instanceFileLoad"
}