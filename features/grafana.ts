import { Botkit } from "botkit";
import { uploadImage, getDashboards } from "../services/grafanaService";
import { ButtonElement } from "../types/blocks";

module.exports = function (controller: Botkit) {
  controller.hears("grafana", "message", async (bot, message) => {
    uploadImage(message.channel);
  });

  controller.hears("대시보드", "message", async (bot, message) => {
    let dashboards = await getDashboards();
    let elements = [] as ButtonElement[];

    dashboards.forEach((dashboard) => {
      elements.push({
        type: "button",
        text: {
          text: dashboard.title,
          type: "plain_text",
        },
        action_id: dashboard.uid,
        value: dashboard.uid,
      });
    });
    await bot.reply(message, {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "대시보드 목록은 아래와 같습니다.\n조회하실 대시보드를 클릭해주세요.",
          },
        },
        {
          type: "divider",
        },
        {
          type: "actions",
          elements: elements,
        },
      ],
    });
  });
};
