import { Botkit } from "botkit";
import { ActionObject, BlockAction, StaticOption } from "../types/blocks";
import { replyPanels, uploadImage } from "../services/grafanaService";

module.exports = function (controller: Botkit) {
  controller.on("block_actions", async (bot, message) => {
    let action = message.incoming_message.channelData.actions[0] as ActionObject;
    let selected = undefined;

    switch (action.type) {
      case "button":
        selected = JSON.parse(action.value) as BlockAction;
        break;
      case "static_select":
        selected = JSON.parse(action.selected_option.value) as StaticOption;
      default:
        break;
    }

    switch (selected.context) {
      case "dashboards":
        await replyPanels(selected.value, action.text.text, bot, message);
        break;
      case "panels":
        uploadImage(message.channel, selected.value.dashboardId, Number(selected.value.panelId));
        break;
      default:
        console.warn(message.incoming_message.channelData.actions);
        await bot.reply(message, "I can't understand...");
    }
  });
};
