/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Botkit } from "botkit";

module.exports = function (controller: Botkit) {
  controller.hears("sample", "message,direct_message", async (bot, message) => {
    await bot.reply(message, "I heard a sample message.");
  });
};
