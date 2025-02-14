import { Core } from "@strapi/strapi";
import { Server, Socket } from "socket.io";

export default {
  /**
   * Register function that runs before your application is initialized.
   */
  register() { },

  /**
   * Bootstrap function that runs before your application gets started.
   */
  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (!strapi.server.httpServer) {
      console.error("HTTP Server not initialized.");
      return;
    }

    const io = new Server(strapi.server.httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    // Store online users
    const userSocketMap: Record<string, string> = {}; // { userId: socketId }

    io.on("connection", (socket: Socket) => {
      console.log("User connected:", socket.id);

      const userId = socket.handshake.query.userId as string;
      if (userId) userSocketMap[userId] = socket.id;

      // Send updated online users list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));

      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
      });

      socket.on("newMessage", (data) => {
        const { receiver, text } = data;
        console.log("New message:", data);
      });
    });

    (strapi as any).io = io;
  },
};
