import { Botkit } from "botkit";
import { replyDashBoards } from "../services/grafanaService";

module.exports = function (controller: Botkit) {
  controller.hears("대시보드", "message", async (bot, message) => {
    await replyDashBoards(bot, message);
  });
};
