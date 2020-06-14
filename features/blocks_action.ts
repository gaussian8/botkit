import { Botkit } from "botkit";
import { ActionObject, ButtonValue } from "../types/blocks";
import { replyPanels, uploadImage } from "../services/grafanaService";

module.exports = function (controller: Botkit) {
  controller.on("block_actions", async (bot, message) => {
    let action = message.incoming_message.channelData.actions[0] as ActionObject;
    let selected = JSON.parse(action.value) as ButtonValue;
    switch (selected.context) {
      case "dashboards":
        await replyPanels(selected.value, bot, message);
        break;
      case "panels":
        uploadImage(message.channel, selected.value.dashboardId, Number(selected.value.panelId));
        break;
      default:
        await bot.reply(message, `you selected ${message.incoming_message.channelData.actions[0].value}`);
    }
  });
};
