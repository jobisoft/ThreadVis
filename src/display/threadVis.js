(async () => {

    let data = await browser.runtime.sendMessage({
        command: "getThreadVisData",
      });
    
      // get the details back from the formerly serialized content
      let v = await Preferences.get(Preferences.VIS_HIDE_ON_SINGLE);
      console.log(v);
      const text = `${await Strings.getString("options.visualisation.zoom.caption")} ${convertRGBtoHSV(3,3,3)} ${convertHSVtoRGB(3,3,3)} ${formatDate(Date.now())}`;
    
      // create the notification element itself
      const notification = document.createElement("div");
      notification.className = "threadVisContainer";
    
      // create the notificatino text element
      const notificationText = document.createElement("div");
      notificationText.className = "threadVisText";
      notificationText.innerText = text;
    
      // add text and button to the notification
      notification.appendChild(notificationText);
    
      // and insert it as the very first element in the message
      document.body.insertBefore(notification, document.body.firstChild);

})();
