export class EventsController extends EventTarget {

	constructor ( ) {
        console.log( `EventsController - constructor` );
		
		super( );
	}

	on ( eventName, callback ) {
		this.addEventListener( eventName, event => {
			console.log(eventName, event)
			callback( event.detail )
		});
	}

	remove ( eventName ) {
		
	}

	emit ( eventName, detail = {} ) {
        console.log( `EventsController - emit ${ eventName }` );
		// console.log(new CustomEvent( eventName, { detail }))
		if ( eventName !== undefined )
			this.dispatchEvent( new CustomEvent( eventName, { detail }));
	}


}

export const events = new EventsController( );
export class Events {
	static requestConnection = "requestConnection";
	static clientConnected = "clientConnected";
	static clientDisconnected = "clientDisconnected";
	static fileList = "fileList";
	static instanceList = "instanceList";
}