"use strict";

var activity;
var selectedResource;
const ofscUrl = "https://api.etadirect.com";


function openMessage(data) {
  // PLACEHOLDER FOR CUSTOM CODE

  //var element = document.getElementById("received-data");
  //element.innerHTML = "<pre>" + JSON.stringify(data, undefined, 4) + "</pre>";


  var activityData = {
    //"aid" : data.activity.aid
  };

  var authString = authenticateUser(data.securedData.clientId, data.securedData.companyName, data.securedData.clientSecret);
  $.ajaxSetup({
    headers: {
      'Authorization': authString
    }
  });

/**
 * 
 * @param {string} clientId  Application ID used for the interactions
 * @param {string} company   Instance name 
 * @param {string} clientSecret Secret generated for the application
 */
  function authenticateUser(clientId, company, clientSecret) {
    var token = `${clientId}@${company}:${clientSecret}`;

    var hash = btoa(token);
    return `Basic ${hash}`;
  }

  /**
   * 
   * @param {string} invaid   Internal inventory ID
   * @param {string} to       External Id of the target resource 
   */
  function moveInventory(invaid, to) {
    return $.getJSON(`${ofscUrl}/rest/ofscCore/v1/inventories/${invaid}`).done(function (data) {
      console.log("Inventory data retrieved:  " + JSON.stringify(data));
      var inventoryItem = data;
      delete inventoryItem.links;
      delete inventoryItem.resourceInternalId;
      // Adding new Item
      inventoryItem.resourceId = to.toString();
      console.log(`Trying to add object ${JSON.stringify(inventoryItem)}`);
      return $.post(`${ofscUrl}/rest/ofscCore/v1/inventories`, JSON.stringify(inventoryItem)).done(function (data) {
        // GET: Success, ADD: Succcess
        console.log(`Added item:${JSON.stringify(data)}`);
        // Removing item from previous owner
        return $.ajax({
            url: `${ofscUrl}/rest/ofscCore/v1/inventories/${invaid}`,
            method: "DELETE"
          })
          .done(function (data) {
            // GET: Success, ADD: Succcess, DELETE: Success
            console.log(`Deleted item:${JSON.stringify(data)}`)
            return true;
          })
          .fail(function (error) {
            // GET: Success, ADD: Succcess, DELETE: Fail
            alert(`Error deleting inventory: ${JSON.stringify(error)}`);
            // TODO: Rollback ADD
          });
      }).fail(function (error) {
        // GET: Success, ADD: Fail
        alert(`Error adding inventory: ${JSON.stringify(error)}`);
      });
    }).fail(function (error) {
      // GET: Fail
      alert(`Error retrieving inventory: ${JSON.stringify(error)}`);
    });
  };


  var inventory_data = [];
  var resource_table = new Tabulator("#resources-table", {
    layout: "fitDataStretch",
    selectable: 1,
    rowSelected: function (row) {
      //row - row component for the selected row
      selectedResource = row;
      $("#button-assign").button("option", "disabled", false);;
    },
    rowDeselected: function (row) {
      selectedResource = null;
      $("#button-assign").button("option", "disabled", true);;
    },
    columns: [{
        title: "ID",
        field: "resourceId",
        width: 100,
        editor: false
      },
      {
        title: "Name",
        field: "name",
        width: 100,
        editor: false
      },
      {
        title: "Parent",
        field: "parentResourceId",
        editor: false
      },
      {
        title: "Type",
        field: "resourceType",
        headerFilter: true
      }
    ],
  });

  for (const property in data.inventoryList) {
    // Only add provider pool equipment with a serial number
    var item = data.inventoryList[property];
    if (item.invsn != null && item.invpool == "provider")
      inventory_data.push(data.inventoryList[property]);
  };

  var inventory_table = new Tabulator("#inventory-table", {
    data: inventory_data,
    reactiveData: true,
    index: "invid",
    layout: "fitDataStretch",
    selectableRangeMode: "click",
    columns: [{
        formatter: "rowSelection",
        field: "is_selected",
        titleFormatter: "rowSelection",
        hozAlign: "center",
        headerSort: false,
        cellClick: function (e, cell) {
          cell.getRow().toggleSelect();
        }
      },
      {
        title: "Serial#",
        field: "invsn",
        width: 100,
        headerFilter: true,
        editor: false
      },
      {
        title: "Type",
        field: "Item Type",
        width: 100,
        headerFilter: true,
        editor: false
      },
      {
        title: "Assigned to",
        field: "assigned",
        headerFilter: true,
        editor: false
      },
      {
        title: "Changed",
        field: "changeApplied",
        headerFilter: true,
        formatter: "tick"
      }
    ],
  });

  // get descendants list
  $.getJSON(`${ofscUrl}/rest/ofscCore/v1/resources/${data.resource.external_id}/descendants`).done(function (data) {
      console.log("job done " + data);
      resource_table.setData(data.items);

      var element = document.getElementById("received-data");
      //element.innerHTML = "<pre>" + JSON.stringify(data, undefined, 4) + "</pre>";
    }

  );
  $('#button-apply').button().click(function (e) {
    // Check all rows that need change in inventoryData and move the inventories
    for (const [index, element] of inventory_data.entries()) {
      if ("assigned" in element && (typeof element.assigned !== 'undefined') && (!element.changeApplied)) {
        console.log(`moving ${element.invid} to ${element.assigned}`)
        moveInventory(element.invid, element.assigned).done(function (data) {
          console.log(`Todo bien en la cadena ${index}`);
          inventory_data[index].changeApplied = true;
        }).fail(function (error) {
          console.log("Error en la cadena");
        });
      }
    }
  });



  $('#button-assign').button().click(function (e) {
    // Check all selected inventory pieces and assign them to the selected resource
    var selectedInventory = inventory_table.getSelectedData();
    var selectedResource = resource_table.getSelectedData();
    var updatedData = selectedInventory.map(function (val) {
      val.assigned = selectedResource[0].resourceId;
      return val;
    });
    inventory_table.updateData(updatedData)
      .then(function () {
        //run code after data has been updated
      })
      .catch(function (error) {
        //handle error updating data
        alert(JSON.stringify(error));
      });
  });

  $('#button-refresh').button().click(function (e) {
    inventory_table.updateData(inventory_data);
  });


  document.getElementById("submit").addEventListener("click", function () {
    closePlugin(activityData);
  });

  // END OF PLACEHOLDER
}

function initMessage(data) {

  var messsageData = {
    apiVersion: 1,
    method: 'initEnd'
  };

  $.ajaxSetup({
    headers: {
      'Authorization': 'Basic ZGVtb2F1dGhAc3VucmlzZTA1MTE6NmJkZDEyN2I5OTJlNjI1MDk0MjczMGYxMzEzYTFiMWJiYzJjMmE3ZWZiZWQ2NjFjNjYyZWQwZDA1ODRhMjdlMA=='
    }
  });

  sendWebMessage(messsageData);
}

function initPlugin() {

  window.addEventListener("message", getWebMessage, false);

  var messsageData = {
    apiVersion: 1,
    method: 'ready'
  };

  sendWebMessage(messsageData);
}

function _isJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function getWebMessage(event) {

  if (typeof event.data === 'undefined') {
    return false;
  }

  if (!_isJson(event.data)) {
    return false;
  }

  var data = JSON.parse(event.data);

  if (!data.method) {
    return false;
  }

  switch (data.method) {
    case 'open':
      openMessage(data);
      break;
    case 'open':
      initMessage(data);
      break;
    case 'error':
      console.log("Received error message " + JSON.stringify(data, undefined, 4));
      break;
      // other methods may go here
  }
}

function getOriginURL(url) {
  if (url != '') {
    if (url.indexOf("://") > -1) {
      return 'https://' + url.split('/')[2];
    } else {
      return 'https://' + url.split('/')[0];
    }
  }
  return '';
}


function closePlugin(activityData) {

  var messageData = {
    "apiVersion": 1,
    "method": "close",
    "activity": activityData
  };
  console.log("Sending close message" + JSON.stringify(messageData, undefined, 4));
  sendWebMessage(messageData);
}

function sendWebMessage(data) {
  var originUrl = document.referrer || (document.location.ancestorOrigins && document.location.ancestorOrigins[0]) || '';

  if (originUrl) {
    parent.postMessage(data, getOriginURL(originUrl));
  }
  console.log("Sending message" + JSON.stringify(data, undefined, 4));
}