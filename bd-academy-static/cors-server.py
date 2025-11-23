#!/usr/bin/env python3
"""
Simple HTTP server with CORS support for bd-academy-static
"""
from http.server import HTTPServer, SimpleHTTPRequestHandler
import sys

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == '__main__':
    port = 5008
    server_address = ('', port)
    httpd = HTTPServer(server_address, CORSRequestHandler)
    print(f'🚀 Static server with CORS running on http://localhost:{port}')
    print(f'📁 Serving files from: {sys.path[0]}')
    print('Press Ctrl+C to stop')
    httpd.serve_forever()
