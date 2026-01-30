import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'auth_service.dart';
import '../config.dart';

class SocketService {
  static final SocketService _instance = SocketService._internal();
  factory SocketService() => _instance;
  SocketService._internal();

  IO.Socket? socket;

  Future<void> connect() async {
    if (socket != null && socket!.connected) return;

    final token = await AuthService().getToken();
    if (token == null) throw Exception('No token');

    socket = IO.io(
      '${AppConfig.baseUrl}/chat',
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setAuth({'token': token})
          .build(),
    );

    socket!.connect();
  }

  void joinRoom(String roomId) {
    socket?.emit('join-room', {'roomId': roomId});
  }

  void sendMessage(String receiverId, String content) {
    
    socket?.emit('send-message', {
      'receiverId': receiverId,
      'content': content,
    });
  }

  void onMessage(Function(dynamic) callback) {
    socket?.on('receive-message', callback);
  }

  void disconnect() {
    socket?.disconnect();
    socket = null;
  }
}
