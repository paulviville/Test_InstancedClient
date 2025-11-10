import { GUI } from './three/libs/lil-gui.module.min.js';
import { events, Events } from "./EventsController.js";

export default class GUIController {
	#gui = new GUI ( );
	#folders = { };

	#items = {
		url: "ws://localhost",
		port: 8080,
		connect: ( ) => { events.emit( Events.requestConnection, { url: this.#items.url, port: this.#items.port } )},

		instances : [ "<empty>" ],
	}

	constructor ( ) {
        console.log( `GUIController - constructor` );

		this.#createConnectionFolder( );

		this.#folders.files = this.#gui.addFolder ( "Server Files" );
		
		this.#folders.instances = this.#gui.addFolder ( "Server Instances" );

		this.#folders.instances.add( this.#items, "instances", [ "<empty>" ] );
	}

	#createConnectionFolder ( ) {
		this.#folders.connection = this.#gui.addFolder( "Connection" );
		this.#folders.connection.add( this.#items, "url" );
		this.#folders.connection.add( this.#items, "port" );
		this.#folders.connection.add( this.#items, "connect" );
	}

	#updateInstanceList ( ) {
		
	}
}