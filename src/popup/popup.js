

(async () => {
  
  document.getElementById("settings").addEventListener('click', () => {
    browser.runtime.openOptionsPage();
    window.close();
  });

  let [tab] = await messenger.tabs.query({currentWindow: true, active: true});
  let { folder } = await messenger.messageDisplay.getDisplayedMessage(tab.id);
  let { accountId, path } = folder;
  let currentFolder = `${accountId}/${path}`;
  let currentAccount = accountId;
  
  // Set checkmarks.
  let disabledFolders = (await Preferences.get(Preferences.DISABLED_FOLDERS)).split(" ");
  let isDisabledFolder = disabledFolders.includes(currentFolder);
  document.getElementById("folder_disabled").dataset.enabled = isDisabledFolder;
  document.getElementById("folder_enabled").dataset.enabled = !isDisabledFolder;

  let disabledAccounts = (await Preferences.get(Preferences.DISABLED_ACCOUNTS)).split(" ");
  let isDisabledAccount = disabledAccounts.includes(currentAccount);
  document.getElementById("account_disabled").dataset.enabled = isDisabledAccount;
  document.getElementById("account_enabled").dataset.enabled = !isDisabledAccount;
  
  // Add listeners.
  document.getElementById("folder_disabled").addEventListener('click', async () => {
    // Add to disabled folders.
    disabledFolders.push(currentFolder);
    await Preferences.set(
      Preferences.DISABLED_FOLDERS,
      disabledFolders.join(" ")
    );
    // TODO: Inform consumers.
    window.close();
  });
  document.getElementById("folder_enabled").addEventListener('click', async () => {
    // Remove from disabled folders.
    await Preferences.set(
      Preferences.DISABLED_FOLDERS,
      disabledFolders.filter(e => e != currentFolder).join(" ")
    );
    // TODO: Inform consumers.
    window.close();
  });
  
  document.getElementById("account_disabled").addEventListener('click', async () => {
    // Add to disabled accounts.
    disabledAccounts.push(currentAccount);
    await Preferences.set(
      Preferences.DISABLED_ACCOUNTS,
      disabledAccounts.join(" ")
    );
    // TODO: Inform consumers.
    window.close();
  });
  document.getElementById("account_enabled").addEventListener('click', async () => {
    // Remove from disabled accounts.
    await Preferences.set(
      Preferences.DISABLED_ACCOUNTS,
      disabledAccounts.filter(e => e != currentAccount).join(" ")
    );
    // TODO: Inform consumers.
    window.close();
  });

})()
