# Debriefing plugin for Oracle Field Service Cloud

Debriefing is the process of reporting time and materials that were used while performing the work order.
The reporting is usually done by a field technician. The field technician usually reports this kind of information:

* Labor - which includes travel time and working time (measured in hours).
* Parts - what parts and materials have been used while performing the work.
* Charges - any extra charges such as toll or parking (measured in money spent).

The "Debriefing" plugin for Oracle Field Service Cloud (OFSC) is a sample code.
It demonstrates how to provide a convenient way for field resource to report time and expenses
and to generate the PDF invoice which is signed by the customer.

All parts, labor, and expense items are stored as the Inventory in corresponding pools in the OFSC.
The invoice file is saved in the property of Activity.


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


## Building of the package

To build resources and produce package use the command (must be run in the root folder of the sources package):

    grunt
    
or

    ojet build --release
    
This will produce the minimized plugin package in the *./build* folder.
Also, there will be two XML files which can be imported into OFSC:

* plugins.xml    - contains the plugin package and its configuration.
* properties.xml - contains description of the Activity and Inventory properties
                   that must exist in OFSC so plugin can use it.


## Adding of properties

### Option 1: Import the properties

You can import the generated *properties.xml* using the Configuration > Properties screen of OFSC as described in the User manual
    
### Option 2: Configure the properties manually

By using the *Configuration > Properties* screen of OFSC, add all properties (if they don't exist yet) that are listed
in the *"Properties used by the plugin"* section of the User manual
    
    
## Adding of the plugin to the OFSC

### Option 1: Import the plugin
    
You can import the generated *plugins.xml* using the Configuration > Forms & Plugins screen of OFSC as described in the User manual

### Option 2: Upload the hosted plugin package
    
* Add new plugin using the *Configuration > Forms & Plugins* screen of OFSC with the following parameters:
    * Name: Debrief
    * Type: HTML5 Application
    * Use Plugin API: checked
    * Hosted Plugin: checked
    * Plugin archive: the *plugin-debriefing-X.Y.Z+TTTTT.zip* file in the *build* directory,
      where X, Y, Z and TTTT depend on the version of the package you've build
    * Available properties: all properties that are listed in the *"Properties used by the plugin"* section
      of the User manual

### Option 3: Host plugin externally

* Extract the *plugin-debriefing-X.Y.Z+TTTTT.zip* archive and host its contents somewhere  
* Add new plugin using the *Configuration > Forms & Plugins* screen of OFSC with the following parameters:
    * Name: Debrief
    * Type: HTML5 Application
    * Use Plugin API: checked
    * Hosted Plugin: unchecked
    * URL: the address of the *index.html*. It must be accessible by the user's browser
    * Available properties: all properties that are listed in the *"Properties used by the plugin"* section
      of the User manual
      
      
## Configuration of the OFSC

* Add new inventory types using the *Configuration > Inventory Types* screen of OFSC
  as described in the User manual.
  
* By using the *Configuration > User Types > Screen Configuration* screen of OFSC, add the button
  to the "Edit/View activity" screen and associate it with the "Debrief [debriefing_plugin]" plugin
  for all types of users, that are supposed to use the plugin.


## Customization and development

* The "Debriefing" plugin is a [JET](https://www.oracle.com/webfolder/technetwork/jet/index.html) Web Application.

* It uses the [Plugin API](https://docs.oracle.com/en/cloud/saas/field-service/19b/fapcf/toc.htm) to retrieve and
  update the OFSC data.

* The Parts Catalog is used to search for Parts which aren't registered in the customer pool.
  See [Integrating with Parts Catalog API](https://docs.oracle.com/en/cloud/saas/field-service/19b/fapcs/toc.htm) for details.

* If you need to use property labels which differ from default ones, you have to update the source code accordingly.

* To change the list of properties that are included into the generated *properties.xml*,
  edit the *src/js/required-properties.json* as needed.
  
* The label and name of the plugin that are included into the generated *plugins.xml*, are defined by the *"plugin"* 
  field of the *src/js/required-properties.json* file.

* To customize the template of the **invoice**, change the markup in the file *src/js/views/invoice.html*
  and the `html2pdfOptions` object in the *src/js/viewModels/invoice.js* if needed.

* The default JET build tasks are customized to adapt them to the OFSC hosted plugin's needs.
  Additional build steps and tasks are defined by *Grunfile.js* in the root folder of the plugin sources
  and are incorporated into the JET build scenario by the *after_build* hook in the *scripts/hooks/after_build.js* file.
  
* To change the invoice logo, you have to replace file "src/css/images/logo.svg".

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

### Configuring the plugin for development

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
    * Name: Debrief
    * Type: HTML5 Application
    * Use Plugin API: checked
    * Hosted Plugin: unchecked
    * URL: the address of the served *index.html*. Foe example, *https://localhost/jet/index.html*
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