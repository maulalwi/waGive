// Bismillah...
// waGive By MMMAlwi
// Created : 2023-03-21 21:22
// Updated : 2023-03-25 22:48

import baileys from "@adiwajshing/baileys";
const makeWASocket = baileys.default;
const { DisconnectReason, useMultiFileAuthState } = baileys;
import chalk from "chalk";
import P from "pino";
import { JsonDB, Config } from "node-json-db";

const db = new JsonDB(new Config("DB", true, true, "/"));
const admin = "6282228882786";
const grup = "6282228882786-1629369421@g.us";

async function startSock() {
  // try {
  const { state, saveCreds } = await useMultiFileAuthState("./auth/");

  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    browser: ["waGive", "Firefox", "100"],
    logger: P({
      level: "silent", // debug, trace, silent
      timestamp: () => `,"time":"${new Date().toJSON()}"`,
    }),
    // implement to handle retries
    getMessage: async (key) => {
      return {
        conversation: "_WAEncChat._\n\n_Silahkan ulangi lagi._",
      };
    },
    // Fix button blank
    // patchMessageBeforeSending: (message) => {
    //   const requiresPatch = !!(
    //     message.buttonsMessage ||
    //     message.templateMessage ||
    //     message.listMessage
    //   );
    //   if (requiresPatch) {
    //     message = {
    //       viewOnceMessage: {
    //         message: {
    //           messageContextInfo: {
    //             deviceListMetadataVersion: 2,
    //             deviceListMetadata: {},
    //           },
    //           ...message,
    //         },
    //       },
    //     };
    //   }
    //   return message;
    // },
  });

  sock.ev.on("messages.upsert", async (m) => {
    let msg = m.messages[0];
    let senderID = msg.key.remoteJid;
    let isMe = msg ? msg.key.fromMe : false;
    let isChat = senderID.endsWith("@s.whatsapp.net");
    let isGrup = senderID.endsWith("@g.us");
    let isReact = msg.message?.reactionMessage?.react ? true : false;
    let memberID = isGrup ? msg.key?.participant : "";
    memberID = memberID.split("@")[0];
    let messageText = String(
      msg.message?.conversation || msg.message?.extendedTextMessage?.text || ""
    );

    if (!isMe && !isReact) {
      await sock.readMessages([msg.key]);
      console.log(
        chalk.green(`senderID    : ${senderID}
memberID    : ${memberID}
isChat      : ${isChat}
isGrup      : ${isGrup}
messageText : ${messageText}`)
      );

      if (senderID == grup) {
      // if (senderID) {
        if (isGrup && messageText.match(/.GIVE/gi)) {
          return await sock.sendMessage(
            senderID,
            {
              text: `*Free 22 VNC 7 hari* 🚀

Dengan chat *#FREEVNC7HARI* di grup ini.

Diundi pada tanngal 28 Maret 2023, jam 20:00 WIB.

_link grup : https://chat.whatsapp.com/EgKUKX4WFBBBuf1N9Tqy2t_

Semoga beruntung 😄`,
            },
            { quoted: msg }
          );
        }

        if (isGrup && messageText.match(/.freevnc7hari/gi)) {
          let cek = -1;
          try {
            cek = await db.getIndex("/user", memberID, "wa");
          } catch (error) {
            console.log(error);
          }

          if (cek != -1) {
            let user = await db.getData(`/user[${await cek}]`);
            return await sock.sendMessage(
              senderID,
              {
                text: `Sudah terdaftar, dengan ID: ${user.id}`,
              },
              { quoted: msg }
            );
          }

          let count = 1;
          try {
            count = (await db.count("/user")) + 1;
          } catch {}

          await db.push(
            "/user[]",
            {
              id: count,
              wa: memberID,
              date: Date.now(),
            },
            true
          );
          return await sock.sendMessage(
            senderID,
            {
              text: `Berhasil mendaftar, dengan ID: ${count}`,
            },
            { quoted: msg }
          );
        }

        if (isGrup && memberID.match(admin) && messageText.match(/.cek/gi)) {
          let allUser = await db.getData("/user");
          let out = allUser.reduce((out, data) => {
            let tag = [];
            try {
              out.tag.push(data.wa + "@s.whatsapp.net");
              tag = out.tag;
            } catch {
              tag = [`${data.wa}@s.whatsapp.net`];
            }
            let sp = String(data.id).length == 1 ? " " : "";
            let text = out.text ? out.text : "";
            text = `${text}\n${sp}${data.id}. @${data.wa}`;

            return {
              text: text,
              tag: tag,
            };
          }, "");
          return await sock.sendMessage(
            senderID,
            {
              text: `*List Member Giveaway* :\n\`\`\`${out.text}\`\`\``,
              mentions: out.tag,
            },
            { quoted: msg }
          );
        }

        if (
          isGrup &&
          memberID.match(admin) &&
          messageText.match(/.randomWin/gi)
        ) {
          function getRandomInt(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
          }

          let count = await db.count("/user");
          let out = "";
          let total = 0;
          let win = [0];
          let tag = [];

          while (true) {
            let random = getRandomInt(1, count);
            let cek = await db.getIndex("/user", random);

            if (cek) {
              let user = await db.getData(`/user[${cek}]`);
              let find = win.find((element) => element == user.id);

              if (!find) {
                win.push(user.id);
                total += 1;
                let sp = String(total).length == 1 ? " " : "";
                let sp2 = String(user.id).length == 1 ? " " : "";
                out += `${sp}${total}. ID: ${sp2}${user.id} WA: @${user.wa}\n`;
                tag.push(`${user.wa}@s.whatsapp.net`);
              } else {
              }

              if (total >= 22) {
                break;
              }
            }
          }
          return await sock.sendMessage(
            senderID,
            {
              text: `*Selamat List Member Win* :\n\n\`\`\`${out}\`\`\``,
              mentions: tag,
            },
            { quoted: msg }
          );
        }
      }

      if (isChat) {
        await sock.sendMessage(
          senderID,
          {
            text: `*Bot ini, dalam masa pengembangan. Tidak bisa diakses untuk sementara.*

_Update pengembangan, join grup Info VNC :_
_https://chat.whatsapp.com/EgKUKX4WFBBBuf1N9Tqy2t_`,
          },
          { quoted: msg }
        );
      }
    }
  });

  sock.ev.on("connection.update", async (update) => {
    // let cekOpen = true
    const { connection, lastDisconnect } = update;

    if (connection == "connecting") {
      console.log("WA     : Connecting...");
    } else if (connection == "open") {
      console.log("WA     : Connection conected.");
      await sock.sendMessage(admin + "@s.whatsapp.net", {
        text: `*#waGive Running!*`,
      });
      // await sock.sendPresenceUpdate("available", admin);
    } else if (connection === "close") {
      // reconnect if not logged out
      if (
        lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
      ) {
        console.log("WA     : Connection closed. Reconnect");
        await startSock();
        // process.exit()
      } else {
        console.log("WA     : Connection closed. You are logged out.");
      }
    } else if (update?.receivedPendingNotifications == true) {
      console.log("WA     : receivedPendingNotifications");
    } else {
      console.log(update);
      console.log("WA     : Connection update."); // , update)
    }
  });

  // listen for when the auth credentials is updated
  sock.ev.on("creds.update", saveCreds);
  // } catch (err) {
  //   console.log(chalk.red(err));
  // }
}

startSock();
