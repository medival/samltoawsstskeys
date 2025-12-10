// Saves options to chrome.storage
function save_options() {
  // Get the filename to be saved
  var FileName = document.getElementById('FileName').value;

  // Does SessionDuration needs to be applied?
  var ApplySessionDuration = $("#SessionDuration option:selected").val();

  // How log should the session be valid?
  var CustomSessionDuration = document.getElementById('CustomSessionDuration').value

  // Is DEBUG log enabled?
  var DebugLogs = $("#DebugLogs option:selected").val();

  // Get the custom SAML URLs entered by the user
  var CustomUrls = [];
  $("input[id^='url_']").each(function (index) {
    var url = $(this).val().trim();
    if (url != '') {
      CustomUrls.push(url);
    }
  });

  // Get the Role_ARN's (Profile/ARNs pairs) entered by the user in the table
  var RoleArns = {};
  // Iterate over all added profiles in the list
  $("input[id^='profile_']").each(function (index) {
    // Replace profile_<rowId> for arn_<rowId> to be able to get value of corresponding arn input field
    var input_id_arn = $(this).attr('id').replace("profile", "arn");
    // Create key-value pair to add to RoleArns dictionary.
    // Only add it to the dict if both profile and arn are not an empty string
    if ($(this).val() != '' && $('#' + input_id_arn).val() != '') {
      RoleArns[$(this).val()] = $('#' + input_id_arn).val();
    }
  });

  // Save into Chrome storage
  chrome.storage.sync.set({
    FileName: FileName,
    ApplySessionDuration: ApplySessionDuration,
    CustomSessionDuration: CustomSessionDuration,
    DebugLogs: DebugLogs,
    CustomUrls: CustomUrls,
    RoleArns: RoleArns
  }, function () {
    // Show 'Options saved' message to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function () {
      status.textContent = '';
    }, 1500);
  });

  // Notify background process of changed storage items.
  chrome.runtime.sendMessage({ action: "reloadStorageItems" }, function (response) {
    console.log(response.message);
  });
}

// Restores state using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    // Default values
    FileName: 'credentials',
    ApplySessionDuration: 'yes',
    CustomSessionDuration: '21600',
    DebugLogs: 'no',
    CustomUrls: [],
    RoleArns: {}
  }, function (items) {
    // Set filename
    document.getElementById('FileName').value = items.FileName;
    // Set CustomSessionDuration
    document.getElementById('CustomSessionDuration').value = items.CustomSessionDuration;
    // Set ApplySessionDuration
    $("#SessionDuration").val(items.ApplySessionDuration);
    // Set DebugLogs
    $("#DebugLogs").val(items.DebugLogs);
    // Set the html for the Custom URLs Table
    $("#custom_urls").html('<table><tr id="tr_url_header"><th>Custom SAML URL</th><th></th><th></th></tr></table>');
    // For each custom URL add table row
    for (var i = 0; i < items.CustomUrls.length; i++) {
      addUrlTableRow('#tr_url_header', items.CustomUrls[i]);
    }
    // Add a blank table row if there are no current entries
    if (items.CustomUrls.length == 0) {
      addUrlTableRow('#custom_urls table tr:last', null);
    }
    // Set the html for the Role ARN's Table
    $("#role_arns").html('<table><tr id="tr_header"><th>Profile</th><th>ARN of the role</th><th></th><th></th></tr></table>');
    // For each profile/ARN pair add table row (showing the profile-name and ARN)
    for (var profile in items.RoleArns) {
      if (items.RoleArns.hasOwnProperty(profile)) {
        addTableRow('#tr_header', profile, items.RoleArns[profile]);
      }
    }
    // Add a blank table row if there are now current entries (So the user can easily add a new profile/ARN pair)
    if (Object.keys(items.RoleArns).length == 0) {
      addTableRow('#role_arns table tr:last', null, null);
    }
    // Show/hide divCustomSessionDuration
    showCustomSessionDurationDiv();
  });
}

// Add a blank table row for the user to add a new profile/ARN pair
function addTableRow(previousRowJquerySelector, profile, arn) {
  // Generate random identifier for the to be added row
  var newRowId = randomId();
  $(previousRowJquerySelector).after(getTableRowHtml(newRowId, profile, arn));
  // Add eventHandlers for the newly added buttons
  $('#btn_add_' + newRowId).on("click", function () {
    addTableRow('#tr_' + newRowId, null, null);
  });
  $('#btn_del_' + newRowId).on("click", function () {
    delTableRow('#tr_' + newRowId);
  });
}

// Remove table row
function delTableRow(tableRowJquerySelector) {
  // Remove table row from the DOM including bound events
  $(tableRowJquerySelector).remove();
}

// Generate HTML for a table row of the role_arns table
function getTableRowHtml(tableRowId, profile, arn) {
  var profileValue = '';
  var arnValue = '';
  // If profile and arn are not NULL, generate HTML value attribute
  if (profile) { profileValue = 'value="' + profile + '"' };
  if (arn) { arnValue = 'value="' + arn + '"' };
  // Generate HTML for the row
  var html = '<tr id="tr_' + tableRowId + '">\
          <th><input type="text" id="profile_' + tableRowId + '" size="18" ' + profileValue + '></th> \
          <th><input type="text" id="arn_' + tableRowId + '" size="55" ' + arnValue + '></th> \
          <th><button id="btn_del_' + tableRowId + '">DEL</button></th> \
          <th><button id="btn_add_' + tableRowId + '">ADD</button></th> \
          </tr>';
  return html;
}

function randomId() {
  return Math.random().toString(36).substr(2, 8);
}

// Add a blank table row for custom URLs
function addUrlTableRow(previousRowJquerySelector, url) {
  var newRowId = randomId();
  $(previousRowJquerySelector).after(getUrlTableRowHtml(newRowId, url));
  $('#btn_url_add_' + newRowId).on("click", function () {
    addUrlTableRow('#tr_url_' + newRowId, null);
  });
  $('#btn_url_del_' + newRowId).on("click", function () {
    delTableRow('#tr_url_' + newRowId);
  });
}

// Generate HTML for a table row of the custom_urls table
function getUrlTableRowHtml(tableRowId, url) {
  var urlValue = '';
  if (url) { urlValue = 'value="' + url + '"' };
  var html = '<tr id="tr_url_' + tableRowId + '">\
          <th><input type="text" id="url_' + tableRowId + '" size="60" placeholder="https://signin.amazonaws.cn/saml" ' + urlValue + '></th> \
          <th><button id="btn_url_del_' + tableRowId + '">DEL</button></th> \
          <th><button id="btn_url_add_' + tableRowId + '">ADD</button></th> \
          </tr>';
  return html;
}

function showCustomSessionDurationDiv() {
  const selectedValue = document.querySelector('select[name="SessionDuration"]').value;
  const addClass = selectedValue === 'yes' ? 'element-hide' : 'element-visible';
  const removeClass = selectedValue === 'no' ? 'element-hide' : 'element-visible';
  document.getElementById('divCustomSessionDuration').classList.add(addClass);
  document.getElementById('divCustomSessionDuration').classList.remove(removeClass);
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('SessionDuration').addEventListener('change', showCustomSessionDurationDiv);