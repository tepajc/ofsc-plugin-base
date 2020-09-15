# Order parts plugin for OFSC

The "Order parts" plugin for Oracle Field Service Cloud (OFSC) is a sample code.
It demonstrates how to use the JET and OFSC Plugin API to provide a convenient way for field resource to order spare parts
if it is needed for repair or installation service and to receive them at a warehouse or another specified location.
It's neither maintained nor supported by Oracle as a licensed product.

## Installation instructions

To start using the plugin, you can just download and import existing plugin package.
Please refer the User manual for details.

To build the package and install it yourself, you need to do the following:

* Install all necessary dependencies
* Build the package
* Import property description or configure the properties manually
* Import plugin or create and configure it manually
* Configure the OFSC (create inventory types and configure screens)

All steps are detailed below.

## Dependencies

Project uses [NodeJS](https://nodejs.org), so first of all you need to install it.
The Node Package Manager (NPM) will be installed automatically.

Project uses [Grunt](https://gruntjs.com/) as a task runner for building.
Run the following command as administrator/root to install the grunt command line interface:

    npm install -g grunt-cli

To install all required NPM dependencies (including Oracle JET), run the following in the project root folder:

    npm install

## Build the package

To build resources and produce package use the command (must be run in the root folder of the sources package):

    grunt

or

    ojet build --release

This will produce the minimized plugin package in the *./build* folder.
Also, there will be two XML files which can be imported into OFSC:

* plugins.xml    - contains the plugin package and its configuration.
* properties.xml - contains description of the Activity and Inventory properties
                   that must exist in OFSC so plugin can use it.

## Configuration of OFSC

### Configure API access

Application have to be created using the `Configuration > Application` screen of OFSC.

API access:
* Core API:
    * Activity - Read-write
    * Resource - Read-only
    * Inventory - Read-write

Authentication settings:
    * Token service: OFSC
    * Select Authenticate using Client ID/Client Secret
    * Client ID/Client Secret values are used for Core API Authentication.

Allow Cross-origin resource sharing (CORS) from the following web domains: checked and textarea is filled with "*" for any hosts or specific hosts used for the hosting plugin.

## Adding of properties

### Option 1: Import the properties

You can import the generated *properties.xml* using the Configuration > Properties screen of OFSC as described in the User manual

### Option 2: Configure the properties manually

By using the *Configuration > Properties* screen of OFSC, add all properties (if they don't exist yet) that are listed
in the *"Properties used by the plugin"* section of the User manual

### Configure activity types

To create the required activity types you should open `Configuration > Activity Types` screen.
Then press `Add activity type` button and fill the form for every of the following activity types:

* Label is ORD; Name is Receive Order;
* The following activity Features are required:
    * Support of not-ordered activities
    * Allow non-scheduled
    * Support of inventory
    * Support of required inventory
    * Allow to create from Incoming interface

### Configure inventory types

To create the required inventory types you should open `Configuration > Inventory Types` screen.
Then press `Add new` button and fill the form for every of the following inventory types:

* Part
	* Label: part
	* Non serialized: checked
	* Model property: Part Item + Revision
	* Name: Part
	* Unit of measurement: ea
* Ordered Part
	* Label: ordered_part
	* Non serialized: checked
	* Model property: Part Item + Revision
	* Name: Ordered Part
	* Unit of measurement: ea
* Received Part
	* Label: received_part
	* Non serialized: checked
	* Model property: Part Item + Revision
	* Name: Received Part
	* Unit of measurement: ea

## Adding of the plugin to the OFSC

### Option 1: Import the plugin

You can import the generated *plugins.xml* using the Configuration > Forms & Plugins screen of OFSC as described in the User manual

### Option 2: Upload the hosted plugin package

* Add new plugin using the *Configuration > Forms & Plugins* screen of OFSC with the following parameters:
    * Name: Order parts
    * Type: HTML5 Application
    * Use Plugin API: checked
    * Hosted Plugin: checked
    * Plugin archive: the *plugin-inventory-management-X.Y.Z+TTTTT.zip* file in the *build* directory, where X, Y, Z and TTTT depend on the version of the package you've build
    * Available properties: all properties that are listed in the *"Properties used by the plugin"* section of the User manual
	* Disable Plugin in offline: checked

### Option 3: Host plugin externally

* Extract the *plugin-inventory-management-X.Y.Z+TTTTT.zip* archive and host its contents somewhere
* Add new plugin using the *Configuration > Forms & Plugins* screen of OFSC with the following parameters:
    * Name: Order parts
    * Type: HTML5 Application
    * Use Plugin API: checked
    * Hosted Plugin: unchecked
    * URL: the address of the *index.html*. It must be accessible by the user's browser
    * Available properties: all properties that are listed in the *"Properties used by the plugin"* section of the User manual
	* Disable Plugin in offline: checked

### Set the following Secure parameters for each option above

* ofscInstance - instance name
* ofscRestEndpoint - REST API endpoint (for example: "api.etadirect.com" or FE's URL)
* ofscRestClientId - API Client ID
* ofscRestClientSecret - API Client secret

Please find appropriate description of Client ID/Client Secret in 'Configure API access' section of this document.

Secure parameters also can be configured into `grunt-tasks/generate-xml/config/secured-params.json` to import them by
generated *plugins.xml* file or set manually via "Forms & Plugins".

## Configure OFSC screens

To configure the plugin on OFSC screens you should open `Configuration > User Types > Screen Configuration` screen.
Add the following links to the needed screens and configure them with `defaultScreen` parameter.

* "Activity List" screen:
    * Add a button `Part cart` to layout and set Screen type as Plugins. Select plugin in Screen list. Then set
    parameter "defaultScreen" as "new-order-screen"
    * Add a button `Parts Ordered` to layout and set Screen type as Plugins. Select plugin in Screen list. Then set
    parameter "defaultScreen" as "order-list-screen"
* "Parts details" screen:
    * Add a button `Order part` to layout and set Screen type as Plugins. Select plugin in Screen list. Then set
    parameter "defaultScreen" as "new-order-screen"
* "Edit/View activity" screen:
    * Add a button `Parts Ordered` to layout and set Screen type as Plugins. Select plugin in Screen list. Then set
    parameter "defaultScreen" as "order-list-screen"

## Customization and development

* The "Order parts" plugin is a [JET](https://www.oracle.com/webfolder/technetwork/jet/index.html) Web Application.

* It uses the [Plugin API](https://docs.oracle.com/en/cloud/saas/field-service/19b/fapcf/toc.htm) to retrieve and
  update the OFSC data.

* The Parts Catalog is used to search for Parts which aren't registered in the customer pool.
  See [Integrating with Parts Catalog API](https://docs.oracle.com/en/cloud/saas/field-service/19b/fapcs/toc.htm) for details.

* It uses the [Core API](https://docs.oracle.com/en/cloud/saas/field-service/19b/cxfsc/toc.htm) to retrieve and
  update the OFSC data.

* If you need to use property labels which differ from default ones, you have to update the source code accordingly.

* To change the list of properties that are included into the generated *properties.xml*,
  edit the *src/js/property-list.js* as needed.

* The label and name of the plugin that are included into the generated *plugins.xml*, are defined by the *"plugin"*
  field of the *src/js/plugin-list.js* file.

* The default JET build tasks are customized to adapt them to the OFSC hosted plugin's needs.
  Additional build steps and tasks are defined by *Grunfile.js* in the root folder of the plugin sources
  and are incorporated into the JET build scenario by the *after_build* hook in the *scripts/hooks/after_build.js* file.

### Available Oracle JET tasks:

1. `ojet build --release` - build the minimized plugin package suitable for uploading it as a hosted plugin into OFSC.
2. `ojet build`           - build the plugin package suitable for adding as externally hosted plugin to OFSC.
3. `ojet serve`           - Run an HTTP server for plugin resources. See *Configuring the plugin for development*.
                            No packages will be produced.

### Alternatively you can use Grunt tasks:

1. `grunt build`    - build the minimized plugin package suitable for uploading it as a hosted plugin into OFSC.
2. `grunt devBuild` - build the plugin package suitable for adding as externally hosted plugin to OFSC.
3. `grunt serve`    - Run an HTTP server for plugin resources. See *Configuring the plugin for development*.
                      No packages will be produced.

The default task `grunt` runs the 'build' command

## Configuring the plugin for development

You don't have to build a package every time you need to test changes made during the development.
You can run the local HTTP server, which will watch the source files for changes and rebuild all needed resources on the fly:

* Run `grunt serve` or `ojet serve` in the root folder of the plugin sources
* As OFSC requires plugin to be served via HTTPS, you need to generate SSL certificates and configure a reverse proxy
  which will deliver the JET resources to user's browser via secure connection.
  For example, the nginx configuration may look like this:

        server {
            listen *:443 ssl http2;

            ssl_certificate     /etc/nginx/cert/ssl.crt;
            ssl_certificate_key /etc/nginx/cert/ssl.key;

            location ~* ^/jet/ {
                rewrite    ^/jet/(.*) /$1 break;
                proxy_pass http://127.0.0.1:8000;
            }
        }

* Add new plugin using the *Configuration > Forms & Plugins* screen of OFSC with the following parameters:
    * Name: Order parts
    * Type: HTML5 Application
    * Use Plugin API: checked
    * Hosted Plugin: unchecked
    * URL: the address of the served *index.html*. For example, *https://localhost/jet/index.html*
    * Available properties: all properties that are listed in the *"Properties used by the plugin"* section
      of the User manual

### Versioning

Every time you build the package, the version is updated automatically,
so **don't forget to commit and push the `package.json`** if you use git or other CVS
to have the package storage and source repository synced.

Build updates the third number in version string along with timestamp, e.g. `1.0.X+YYYYYYYYYYYYY`,
where X and Y are updatable parts.

To update the first number, run the following manually:

    grunt bumpup:major

To update the second number, run this:

    grunt bumpup:minor

Please notice, that timestamp part will be lost in this case, so after manual version bump you should run build again.
