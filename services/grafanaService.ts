import Axios, { AxiosResponse } from "axios";
import { BotWorker, BotkitMessage } from "botkit";
import { ButtonElement, StaticSelect, BlockAction, StaticOption } from "../types/blocks";
const FormData = require("form-data");

export type Dashboard = {
  uid: string;
  title: string;
};

export type Panel = {
  id: number;
  title: string;
};

const GRAFANA_BASE_URL = process.env.GRAFANA_BASE_URL;
const IMAGE_WIDTH = process.env.GRAFANA_IMAGE_WIDTH;
const IMAGE_HEIGHT = process.env.GRAFANA_IMAGE_HEIGHT;
const grafanaAuth = {
  Authorization: "Bearer " + process.env.GRAFANA_API_TOKEN,
};
const slackAuth = {
  Authorization: "Bearer " + process.env.BOT_TOKEN,
};

export async function replyDashBoards(bot: BotWorker, message: BotkitMessage) {
  let dashboards = await _getDashboards();
  let elements = [] as ButtonElement[];

  dashboards.forEach((dashboard) => {
    let buttonValue = {
      context: "dashboards",
      value: dashboard.uid,
    };
    elements.push({
      type: "button",
      text: {
        text: dashboard.title,
        type: "plain_text",
      },
      value: JSON.stringify(buttonValue),
    });
  });
  await bot.reply(message, {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "대시보드 목록은 아래와 같습니다.\n조회하실 대시보드를 선택해주세요.",
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
}

export async function replyPanels(dashboardId: string, dashboardName: string, bot: BotWorker, message: BotkitMessage) {
  let panels = await _getPanels(dashboardId);
  let elements = [] as StaticSelect[];
  let panelOptions = [] as StaticOption[];

  panels.forEach((panel) => {
    let blockAction = new BlockAction("panels", {
      panelId: panel.id,
      dashboardId: dashboardId,
    });

    panelOptions.push(new StaticOption(panel.title, JSON.stringify(blockAction)));
  });

  elements.push(new StaticSelect("Select a panel", panelOptions));

  await bot.reply(message, {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\`${dashboardName}\` 내 패널 목록은 아래와 같습니다.\n조회하실 패널을 선택해주세요.`,
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
}

export async function uploadImage(channel: string, dashboardId: string, panelId: number, from?: string, to?: string) {
  from = from === undefined ? "now-3h" : from;
  to = to === undefined ? "now" : to;
  let imgBuffer = (await _fetchImage(dashboardId, panelId, from, to)) as Buffer;
  await _uploadFileToSlack(imgBuffer, channel);
}

function _getDashboards() {
  let dashboards = [] as Dashboard[];
  return Axios.get(GRAFANA_BASE_URL + "/api/search", {
    headers: grafanaAuth,
    params: {
      type: "dash-db",
    },
  })
    .then((res) => {
      res.data.forEach((dashboard) => {
        dashboards.push({
          uid: dashboard.uid,
          title: dashboard.title,
        });
      });
      return dashboards;
    })
    .catch((err) => {
      console.error(err.message);
      return dashboards;
    });
}

function _getPanels(dashboardId: string) {
  let panels = [] as Panel[];
  return Axios.get(GRAFANA_BASE_URL + "/api/dashboards/uid/" + dashboardId, {
    headers: grafanaAuth,
  })
    .then((res) => {
      res.data.dashboard.panels.forEach((panel) => {
        panels.push({
          id: panel.id,
          title: panel.title,
        });
      });
      return panels;
    })
    .catch((err) => {
      console.error(err.message);
      return panels;
    });
}

function _fetchImage(dashBoardId: string, panelId: number, from: string, to: string) {
  return Axios.get(GRAFANA_BASE_URL + "/render/d-solo/" + dashBoardId, {
    responseType: "arraybuffer",
    params: {
      panelId: panelId,
      from: from,
      to: to,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
    },
    headers: grafanaAuth,
  })
    .then((res: AxiosResponse<Buffer>) => {
      return res.data;
    })
    .catch((err: Error) => {
      console.error(err.message);
      return undefined;
    });
}

function _uploadFileToSlack(file: Buffer, channel: string) {
  const form = new FormData();
  form.append("file", file, "grafana_panel");
  form.append("filetype", "png");
  form.append("title", "grafana");
  form.append("channels", channel);

  return Axios.post("https://slack.com/api/files.upload", form, {
    headers: { ...slackAuth, ...form.getHeaders() },
  });
}
