import Messages from "./Test_Network/Messages.js";
import Commands from "./Test_Network/Commands.js";
import { events, Events } from "./EventsController.js";

export default class ClientManager {
	#socket;
	#userId;

	#commandsHandlers = {
		[ Commands.SET_USER ]: this.#commandSetUser.bind( this ),
		[ Commands.INSTANCE_LIST ]: this.#commandInstanceList.bind( this ),
		[ Commands.INSTANCE_NEW ]: this.#commandInstanceNew.bind( this ),
		[ Commands.NEW_USER ]: this.#commandNewUser.bind( this ),
		[ Commands.REMOVE_USER ]: this.#commandRemoveUser.bind( this ),
		[ Commands.FILE_LIST ]: this.#commandFilesList.bind( this ),
		[ Commands.FILE_TRANSFER ]: this.#commandFileTransfer.bind( this ),
	}

	constructor ( ) {
		console.log("ClientManager - constructor");

		events.on( Events.socketConnect, ( { url, port } ) => { this.connect( url, port ); });
		events.on( Events.socketDisconnect, ( { url, port } ) => { this.disconnect( url, port ); });
		events.on( Events.instanceJoin, ( { instanceName } ) => { this.requestJoinInstance( instanceName ); });
		events.on( Events.instanceLeave, ( { instanceName } ) => { this.requestLeaveInstance( instanceName ); });
		events.on( Events.instanceNew, ( { instanceName } ) => { this.requestNewInstance( instanceName ); });
    }

	connect ( url = "ws://localhost", port = 8080 ) {
		console.log(`ClientManager - connect ${url}:${ port }`);

		this.#socket = new WebSocket(`${ url }:${ port }`);

		this.#socket.onopen = this.#handleOnOpen.bind( this );
        this.#socket.onerror = this.#handleOnError.bind( this );
        this.#socket.onmessage = this.#handleOnMessage.bind( this );
        this.#socket.onclose = this.#handleOnClose.bind( this );

	}

	disconnect ( ) {
		console.log(`ClientManager - disconnect`);

		this.#socket.close( );
	}

    #handleOnOpen ( ) {
		console.log(`ClientManager - #handleOnOpen`);

		events.emit( Events.socketOpened );
    }

	#handleOnError ( error ) {
		console.log(`ClientManager - #handleOnError`);

        console.error('WebSocket error:', error);
		events.emit( Events.socketError );

    }

	#handleOnClose ( event ) {
		console.log(`ClientManager - #handleOnClose`);

        if ( event.wasClean ) {
            console.log(`WebSocket closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
            console.warn('WebSocket connection closed unexpectedly.');
        }

		events.emit( Events.socketClosed );
    }

	#handleOnMessage ( message ) {
		console.log(`ClientManager - #handleOnMessage`);

		const messageData = JSON.parse(message.data);
		// console.log( messageData );
		
		const handlerFunction = this.#commandsHandlers[ messageData.command ];
		if ( handlerFunction ) {
			handlerFunction( parseInt( messageData.senderId ), messageData );
		}
		else {
			console.log(`Unknown command ${messageData.command}`);
		}

    }

	#commandSetUser ( senderId, data ) {
		console.log(`ClientManager - #commandSetUser ${ senderId } ${ data }`);

		this.#userId = data.userId;
	}

	#commandInstanceList ( senderId, data ) {
		console.log( `ClientManager - #commandInstanceList ${ senderId }` );
		
		console.log( data.instancesList );
		/// update gui list?

		events.emit( Events.instanceList, { instancesList: data.instancesList });
	}

	#commandInstanceNew ( senderId, data ) {
		console.log( `ClientManager - #commandInstanceNew ${ senderId }` );
		/// confirmation of requested creation of instance
		
		console.log( data );
	}

	#commandNewUser ( senderId, userId ) {
		console.log( `ClientManager - #commandNewUser ${ senderId } ${ userId }` );
		
		console.log( userId );
	}

	#commandRemoveUser ( senderId, userId ) {
		console.log( `ClientManager - #commandRemoveUser ${ senderId } ${ userId }` );
		
		console.log( userId );
	}

	#commandFilesList ( senderId, data ) {
		console.log( `ClientManager - #commandFilesList ${ senderId }` );
		
		console.log( data.filesList );
		events.emit( Events.fileList, { filesList: data.filesList });
	}

	#commandFileTransfer ( senderId, data ) {
		console.log( `ClientManager - #commandFileTransfer ${ senderId }` );
		
		const decodedFile = Messages.decodeFile( data.file );
		console.log( decodedFile );
	}

	requestNewInstance ( instanceName ) {
		console.log( `ClientManager - requestNewInstance ${ instanceName }` );

		this.#send( Messages.newInstance( this.#userId, instanceName ) );
	}

	requestJoinInstance ( instanceName ) {
		console.log( `ClientManager - requestJoinInstance ${ instanceName }` );

		this.#send( Messages.joinInstance( this.#userId, instanceName ) );
	}

	requestLeaveInstance ( instanceName ) {
		console.log( `ClientManager - requestLeaveInstance ${ instanceName }` );

		this.#send( Messages.leaveInstance( this.#userId, instanceName ) );
	}

	requestFileRequest ( fileName ) {
		console.log( `ClientManager - requestFileRequest ${ fileName }` );

		this.#send( Messages.fileRequest( this.#userId, fileName ) );
	}

	async loadFile ( path, fileName ) {
		const filePath = `${ path }/${ fileName }`;

		const response = await fetch( filePath );
		const fileBuffer = await response.arrayBuffer( );

		const encodedFile = Messages.encodeFile( fileBuffer );
		
		this.#send( Messages.fileTransfer( this.#userId, fileName, encodedFile ) );
	}

	#send ( message ) {
		// console.log(`ClientManager - #send`);	

        this.#socket.send(message);
    }
}