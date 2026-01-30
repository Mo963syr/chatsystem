import 'package:flutter/material.dart';
import 'chat_screen.dart';

class StartChatScreen extends StatefulWidget {
  const StartChatScreen({super.key});

  @override
  State<StartChatScreen> createState() => _StartChatScreenState();
}

class _StartChatScreenState extends State<StartChatScreen> {
  final TextEditingController receiverCtrl = TextEditingController();

  void openChat() {
    final receiverId = receiverCtrl.text.trim();
    if (receiverId.isEmpty) return;

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => ChatScreen(receiverId: receiverId),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Start Chat')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: receiverCtrl,
              decoration: const InputDecoration(
                labelText: 'Receiver User ID',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: openChat,
              child: const Text('Open Chat'),
            ),
          ],
        ),
      ),
    );
  }
}
