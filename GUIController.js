import { GUI } from './three/libs/lil-gui.module.min.js';
import { events, Events } from "./EventsController.js";

export default class GUIController {
	#gui = new GUI ( );

	#folders = {
		connection: {
			folder: this.#gui.addFolder( "Connection" ),
			gui: { },
			data: {
				url: "ws://localhost",
				port: 8080,
				connect: ( ) => this.#handleConnect( ),
				disconnect: ( ) => this.#handleDisconnect( ),
			},
		},
		instances: {
			folder: this.#gui.addFolder( "Instances" ),
			subfolders: { },
			gui: { },
			data: {
				newInstance: "",
				selectedName: "",
				select: null,
				instances: {},
				create: ( ) => this.#handleInstanceCreate( ),
				join: ( ) => this.#handleInstanceJoin( ),
				leave: ( ) => this.#handleInstanceLeave( ),
			},
		},
		files: {
			folder: this.#gui.addFolder( "Files" ),
			subfolders: { },
			gui: { },
			data: { 
				select: null,
				files: {},
				request: ( ) => this.#handleFileRequest( ),
				load: ( ) => this.#handleLoadFile( ),
				loadInstance: ( ) => this.#handleInstanceLoadFile( ),
			},
		},
	}

	constructor ( ) {
        console.log( `GUIController - constructor` );

		this.#createConnectionFolder( );
		this.#createInstancesFolder( );
		this.#createFilesFolder( );
		this.#folders.instances.folder.hide( );
		this.#folders.files.folder.hide( );

		this.#initializeListeners( );
	}

	#initializeListeners ( ) {
        console.log( `GUIController - #initializeListeners` );

		events.on( Events.socketOpened, ( ) => {
			this.#folders.instances.folder.show( );
			this.#folders.files.folder.show( );
		});

		events.on( Events.socketClosed, ( ) => {
			this.#folders.instances.folder.hide( );
			this.#folders.files.folder.hide( );
		});

		events.on( Events.instanceList, ( { instancesList } ) => { this.#updateInstanceList( instancesList ) });
	
		events.on( Events.instanceJoin, ( { instanceName } ) => { 
			this.#folders.instances.data.selectedName = instanceName;
			this.#folders.instances.gui.selectedName.show( );
			this.#folders.instances.gui.leave.show( );
			this.#folders.instances.gui.join.hide( );
			this.#folders.instances.gui.instanceList.hide( );
			this.#folders.instances.subfolders.create.hide( );
		});

		events.on( Events.instanceLeave, ( ) => { 
			this.#folders.instances.data.selectedName = "";
			this.#folders.instances.gui.selectedName.hide( );
			this.#folders.instances.gui.leave.hide( );
			this.#folders.instances.gui.join.show( );
			this.#folders.instances.gui.instanceList.show( );
			this.#folders.instances.subfolders.create.show( );
		});

		events.on( Events.fileList, ( { filesList } ) => { this.#updateFilesList( filesList ) });

	}

	#createConnectionFolder ( ) {
		const folder = this.#folders.connection.folder;
		const gui = this.#folders.connection.gui;
		const data = this.#folders.connection.data;

		gui.url = folder.add( data, "url" );
		gui.port = folder.add( data, "port" );
		gui.connect = folder.add( data, "connect" );
		gui.disconnect = folder.add( data, "disconnect" );

		gui.disconnect.hide( );
	}

	#createInstancesFolder ( ) {
		const folder = this.#folders.instances.folder;
		const gui = this.#folders.instances.gui;
		const data = this.#folders.instances.data;

		const subfolder = folder.addFolder( "create instance" );
		subfolder.close( );
		this.#folders.instances.subfolders.create = subfolder;
		gui.newInstance = subfolder.add( data, "newInstance" );
		gui.create = subfolder.add( data, "create" );
		gui.selectedName = folder.add( data, "selectedName" ).listen().disable();
		gui.join = folder.add( data, "join" );
		gui.leave = folder.add( data, "leave" );

		gui.leave.hide( );
		gui.selectedName.hide( );
	}

	#createFilesFolder ( ) {
		const folder = this.#folders.files.folder;
		const gui = this.#folders.files.gui;
		const data = this.#folders.files.data;

		const subfolder = folder.addFolder( "server files" );
		this.#folders.files.subfolders.serverFiles = subfolder;
		// gui.newInstance = subfolder.add( data, "newInstance" );
		gui.request = subfolder.add( data, "request" );
		// gui.selectedName = folder.add( data, "selectedName" ).listen().disable();
		// gui.join = folder.add( data, "join" );
		// gui.leave = folder.add( data, "leave" );

		// gui.leave.hide( );
		// gui.selectedName.hide( );

		folder.add( data, "load" );
		subfolder.add( data, "loadInstance" );
	}

	#updateInstanceList ( instanceList ) {
        console.log( `GUIController - #updateInstanceList` );

		const folder = this.#folders.instances.folder;
		const data = this.#folders.instances.data;
		const gui = this.#folders.instances.gui;

		if ( gui.instanceList ) {
			gui.instanceList.destroy( );
		}

		data.instances = { };
		for( const instance of instanceList ) {
			data.instances[ instance.name ] = instance.name;
		}

		gui.instanceList = folder.add( data, "select", data.instances );
		gui.instanceList.onChange ( ( value ) => {
			data.select = value;
		});

		if ( data.selectedName != "" ) {
			gui.instanceList.hide( );
		}
	}

	#updateFilesList ( filesList ) {
        console.log( `GUIController - #updateFilesList` );

		const folder = this.#folders.files.folder;
		const subfolders = this.#folders.files.subfolders;
		const data = this.#folders.files.data;
		const gui = this.#folders.files.gui;

		if ( gui.filesList ) {
			gui.filesList.destroy( );
		}

		console.log(filesList)
		data.files = { };
		for ( const file of filesList ) {
			data.files[ file.name ] = file.name;
		}
		gui.filesList = subfolders.serverFiles.add( data, "select", data.files ).name("");
		gui.filesList.onChange ( ( value ) => {
			data.select = value;
		});
	}

	#handleConnect ( ) {
        console.log( `GUIController - #handleConnect` );
		const data = this.#folders.connection.data;

		events.emit( Events.socketConnect, { url: data.url, port: data.port } );
		
		// const folder = this.#folders.connection.folder;
		const gui = this.#folders.connection.gui;
		gui.url.hide( );
		gui.port.hide( );
		gui.connect.hide( );
		gui.disconnect.show( );
	}

	#handleDisconnect ( ) {
        console.log( `GUIController - #handleDisconnect` );

		events.emit( Events.socketDisconnect );

		const gui = this.#folders.connection.gui;
		gui.url.show( );
		gui.port.show( );
		gui.connect.show( );
		gui.disconnect.hide( );

		this.#folders.instances.folder.hide( );
		this.#folders.files.folder.hide( );
	}

	#handleInstanceJoin ( ) {
        console.log( `GUIController - #handleInstanceJoin` );

		const selected = this.#folders.instances.data.select;

		if ( selected ?? false ) {
			events.emit( Events.instanceJoin, { instanceName: selected } );
		}
	}

	#handleInstanceCreate ( ) {
        console.log( `GUIController - #handleInstanceCreate` );

		const newInstance = this.#folders.instances.data.newInstance;

		if ( newInstance != "" ) {
			events.emit( Events.instanceNew, { instanceName: newInstance } );

			this.#folders.instances.data.newInstance = "";
		}
		
	}

	#handleInstanceLeave ( ) {
        console.log( `GUIController - #handleInstanceLeave` );

		const selected = this.#folders.instances.data.select;
		if ( selected ?? false ) {
			events.emit( Events.instanceLeave, { instanceName: selected } );
		}


	}

	#handleFileRequest ( ) {
        console.log( `GUIController - #handleFileRequest` );

		const fileName = this.#folders.files.data.select;
		console.log(fileName)
		if ( fileName ) {
			events.emit( Events.fileRequest, { fileName: fileName } );
		}
		
	}

	#handleLoadFile ( ) {
        console.log( `GUIController - #handleLoadFile` );

		const input = document.createElement( "input" );
		input.type = "file";

		input.onchange = ( ) => {
			console.log( input.files[0] );

			const file = input.files[ 0 ];
			if ( !file ) {
				return; 
			}

			const fileReader = new FileReader( );
			fileReader.onload = ( ) => {
				console.log({
					name: file.name,
					type: file.type,
					size: file.size,
					content: fileReader.result,
				});

				events.emit( Events.fileUpload, { fileName: file.name, fileBuffer: fileReader.result });
			};
			
			fileReader.readAsArrayBuffer( file )
		};

		input.click();
		// const fileName = this.#folders.files.data.select;
		// console.log(fileName)
		// if ( fileName ) {
		// 	events.emit( Events.fileRequest, { fileName: fileName } );
		// }
		
	}

	#handleInstanceLoadFile ( ) {
        console.log( `GUIController - #handleInstanceLoadFile` );

		events.emit( Events.instanceFileLoad, { });
		
	}
}