import Messages from "../Test_InstancedServer/Test_Network/Messages.js";
import Commands from "./Test_Network/Commands.js";

export default class ClientManager {
	#socket;
	#userId;

	#commandsHandlers = {
		[ Commands.SET_USER ]: this.#commandSetUser.bind( this ),
		[ Commands.INSTANCE_LIST ]: this.#commandInstanceList.bind( this ),
		// [ Commands.INSTANCE_NEW ]: this.#commandInstanceNew.bind( this ),
	}

	constructor ( ) {
		console.log("ClientManager - constructor");
    }

	connect ( port = 8080, ip = "ws://localhost" ) {
		console.log(`ClientManager - connect ${ port }`);

		this.#socket = new WebSocket(`${ ip }:${ port }`);


		this.#socket.onopen = this.#handleOnOpen.bind( this );
        this.#socket.onerror = this.#handleOnError.bind( this );
        this.#socket.onmessage = this.#handleOnMessage.bind( this );
        this.#socket.onclose = this.#handleOnClose.bind( this );
	}

	disconnect ( ) {
		this.#socket.close( );
	}

    #handleOnOpen ( ) {
		console.log(`ClientManager - #handleOnOpen`);
    }

	#handleOnError ( error ) {
		console.log(`ClientManager - #handleOnError`);

        console.error('WebSocket error:', error);
    }

	#handleOnClose ( event ) {
		console.log(`ClientManager - #handleOnClose`);

        if ( event.wasClean ) {
            console.log(`WebSocket closed cleanly, code=${event.code}, reason=${event.reason}`);
        } else {
            console.warn('WebSocket connection closed unexpectedly.');
        }
    }

	#handleOnMessage ( message ) {
		console.log(`ClientManager - #handleOnMessage`);

		const messageData = JSON.parse(message.data);
		console.log( messageData );
		
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

	#commandInstanceList ( senderId, instanceList ) {
		console.log( `ClientManager - #commandInstanceList ${ senderId }` );
		
		console.log( instanceList );
		/// update gui list?
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


	// #commandInstanceNew ( senderId, instanceName ) {
	// 	console.log( `ServerManager - #commandInstanceNew ${ senderId } ${ instanceName }` );

	// 	this.#instancesManager.newInstance( instanceName );

	// 	const instancesList = this.#instancesManager.instancesData;
	// 	this.#broadcast( Messages.instancesList( instancesList ) );
	// }

	#send ( message ) {
		// console.log(`ClientManager - #send`);	

        this.#socket.send(message);
    }
}