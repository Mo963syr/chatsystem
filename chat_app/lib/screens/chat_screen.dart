import 'package:flutter/material.dart';
import '../services/socket_service.dart';

class ChatScreen extends StatefulWidget {
  final String receiverId;
  ChatScreen({required this.receiverId});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final messageCtrl = TextEditingController();
  final List<Map<String, dynamic>> messages = [];
  final socketService = SocketService();

  @override
  void initState() {
    super.initState();
    initSocket();
  }

  void initSocket() async {
    await socketService.connect();

    final roomId = 'YOUR_ID_${widget.receiverId}'; // نفس منطق الباك
    socketService.joinRoom(roomId);

    socketService.onMessage((data) {
      setState(() {
        messages.add(data);
      });
    });
  }

  void sendMessage() {
    if (messageCtrl.text.isEmpty) return;

    socketService.sendMessage(
      widget.receiverId,
      messageCtrl.text,
    );

    messageCtrl.clear();
  }

  @override
  void dispose() {
    socketService.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Chat')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: messages.length,
              itemBuilder: (_, i) {
                return ListTile(
                  title: Text(messages[i]['content'] ?? ''),
                );
              },
            ),
          ),
          Row(
            children: [
              Expanded(
                child: TextField(controller: messageCtrl),
              ),
              IconButton(
                icon: Icon(Icons.send),
                onPressed: sendMessage,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
