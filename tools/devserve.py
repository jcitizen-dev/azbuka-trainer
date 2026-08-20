#!/usr/bin/env python3
"""Static server for local testing that never lets the browser cache a file."""
import http.server, socketserver, sys
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control","no-store, max-age=0")
        super().end_headers()
    def log_message(self,*a): pass
port=int(sys.argv[1]) if len(sys.argv)>1 else 8731
socketserver.TCPServer.allow_reuse_address=True
with socketserver.TCPServer(("",port),H) as s: s.serve_forever()
