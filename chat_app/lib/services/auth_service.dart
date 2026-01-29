import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config.dart';

class AuthService {
  // ✅ تعريف Dio
  final Dio dio = Dio(
    BaseOptions(
      baseUrl: AppConfig.baseUrl, // مثال: http://10.0.2.2:3000
      headers: {
        'Content-Type': 'application/json',
      },
    ),
  );

  Future<dynamic> login(String email, String password) async {
    try {
      final res = await dio.post(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
      );

      print('SERVER RESPONSE: ${res.data}');

      // 🔹 حفظ التوكن لو موجود
      final prefs = await SharedPreferences.getInstance();
      if (res.data['access_token'] != null) {
        await prefs.setString(
          'access_token',
          res.data['access_token'],
        );
      }

      return res.data;
    } on DioException catch (e) {
      print('STATUS CODE: ${e.response?.statusCode}');
      print('ERROR DATA: ${e.response?.data}');
      rethrow;
    }
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('access_token');
  }
}
