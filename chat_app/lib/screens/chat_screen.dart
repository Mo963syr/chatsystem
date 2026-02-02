import 'package:flutter/material.dart';
import '../services/socket_service.dart';
import '../services/auth_service.dart';
import '../services/ChatApiService.dart';

class ChatScreen extends StatefulWidget {
  final String receiverId;
  const ChatScreen({super.key, required this.receiverId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final socketService = SocketService();
  final messageCtrl = TextEditingController();
  final List<Map<String, dynamic>> messages = [];
 final chatApi = ChatApiService();

  String? myId;

  @override
  void initState() {
    super.initState();
    initSocket();
  }

 Future<void> initSocket() async {
  myId = await AuthService().getUserId();
  if (myId == null) return;

  // 🔹 1) جلب المحادثات السابقة
  final history = await chatApi.getChatHistory(
    myId!,
    widget.receiverId,
  );

  setState(() {
    messages.addAll(history);
  });

  // 🔹 2) الاتصال بالسوكت
  await socketService.connect();

  final roomId = [myId!, widget.receiverId]..sort();
  socketService.joinRoom(roomId.join('_'));

  // 🔹 3) استقبال الرسائل الجديدة
  socketService.onMessage((data) {
    setState(() {
      messages.add(data);
    });
  });
}

  void sendMessage() {
    
    final text = messageCtrl.text.trim();
    if (text.isEmpty || myId == null) return;

    socketService.sendMessage(widget.receiverId, text);
    messageCtrl.clear();
  }

  @override
  void dispose() {
    socketService.disconnect();
    messageCtrl.dispose();
    super.dispose();
  }

  Widget chatBubble(Map<String, dynamic> msg) {
    final bool isMe = msg['sender'] == myId;

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        padding: const EdgeInsets.all(12),
        constraints: const BoxConstraints(maxWidth: 280),
        decoration: BoxDecoration(
          color: isMe ? const Color(0xff38BDF8) : const Color(0xff1E293B),
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isMe ? 16 : 0),
            bottomRight: Radius.circular(isMe ? 0 : 16),
          ),
        ),
        child: Text(
          msg['content'] ?? '',
          style: const TextStyle(color: Colors.white),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xff0F172A),
      appBar: AppBar(
        backgroundColor: const Color(0xff020617),
        title: const Text('Chat'),
      ),
      body: Column(
        children: [
       Expanded(
  child: ListView.builder(
    reverse: false,
    itemCount: messages.length,
    itemBuilder: (_, i) => chatBubble(messages[i]),
  ),
),

          inputBar(),
        ],
      ),
    );
  }

  Widget inputBar() {
    return Container(
      padding: const EdgeInsets.all(8),
      color: const Color(0xff020617),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: messageCtrl,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'اكتب رسالة...',
                hintStyle: const TextStyle(color: Colors.white54),
                filled: true,
                fillColor: const Color(0xff1E293B),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(25),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(width: 6),
          CircleAvatar(
            backgroundColor: const Color(0xff38BDF8),
            child: IconButton(
              icon: const Icon(Icons.send, color: Colors.black),
              onPressed: sendMessage,
            ),
          ),
        ],
      ),
    );
  }
}
