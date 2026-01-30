import 'package:dio/dio.dart';
import '../config.dart';
import 'auth_service.dart';

class ChatApiService {
  final Dio dio = Dio(
    BaseOptions(baseUrl: AppConfig.apiBaseUrl),
  );

  Future<List<Map<String, dynamic>>> getChatHistory(
    String myId,
    String otherId,
  ) async {
    final token = await AuthService().getToken();

  final response = await dio.get(
  '/messages/between/$myId/$otherId',
  options: Options(
    headers: {
      'Authorization': 'Bearer $token',
    },
  ),
);


    return List<Map<String, dynamic>>.from(response.data);
  }
}
