import 'package:flutter/material.dart';
import '../services/auth_service.dart';
import 'chat_screen.dart';
import 'package:dio/dio.dart';

class LoginScreen extends StatefulWidget {
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailCtrl = TextEditingController();
  final passCtrl = TextEditingController();
  bool loading = false;

  void login() async {
    setState(() => loading = true);

    try {
      final response = await AuthService().login(
        emailCtrl.text.trim(),
        passCtrl.text.trim(),
      );

      // 🔹 طباعة الرد الكامل
      print('LOGIN RESPONSE: $response');

      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => ChatScreen(
            receiverId: '697912b5c3d60d123e8c482b',
          ),
        ),
      );
    } catch (e) {
      print('LOGIN ERROR RAW: $e');

      String errorMessage = 'فشل تسجيل الدخول';

      if (e is DioException) {
        // 🔴 هذا هو الحل
        print('STATUS CODE: ${e.response?.statusCode}');
        print('SERVER DATA: ${e.response?.data}');

        errorMessage = e.response?.data['message']?.toString() ??
            e.message ??
            'خطأ من السيرفر';
      } else {
        errorMessage = e.toString();
      }

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
                controller: emailCtrl,
                decoration: InputDecoration(labelText: 'Email')),
            TextField(
                controller: passCtrl,
                decoration: InputDecoration(labelText: 'Password'),
                obscureText: true),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: loading ? null : login,
              child: Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}
