<?php
/**
 * Mailer.php — Client SMTP minimal avec support STARTTLS et SSL
 *
 * Compatible Infomaniak (port 587), Gmail (port 587 / 465), OVH, etc.
 * Aucune dépendance externe requise.
 */

class Mailer
{
    private string $host;
    private int    $port;
    private string $username;
    private string $password;
    private string $fromEmail;
    private string $fromName;

    public function __construct()
    {
        $this->host      = SMTP_HOST;
        $this->port      = SMTP_PORT;
        $this->username  = SMTP_USER;
        $this->password  = SMTP_PASS;
        $this->fromEmail = SMTP_FROM_EMAIL;
        $this->fromName  = SMTP_FROM_NAME;
    }

    /**
     * Envoyer un email via SMTP authentifié.
     *
     * @param string $to       Adresse destinataire
     * @param string $subject  Objet du mail
     * @param string $body     Corps du message (texte brut)
     * @param string $replyTo  Adresse Reply-To optionnelle
     */
    public function send(string $to, string $subject, string $body, string $replyTo = ''): bool
    {
        try {
            // Port 465 → SSL direct, port 587 → TCP + STARTTLS
            $transport = ($this->port === 465)
                ? "ssl://{$this->host}:{$this->port}"
                : "tcp://{$this->host}:{$this->port}";

            $context = stream_context_create([
                'ssl' => [
                    'verify_peer'       => false,
                    'verify_peer_name'  => false,
                ]
            ]);

            $socket = stream_socket_client($transport, $errno, $errstr, 15, STREAM_CLIENT_CONNECT, $context);

            if (!$socket) {
                error_log("[Mailer] Connexion SMTP impossible — $errstr ($errno)");
                return false;
            }

            stream_set_timeout($socket, 15);

            // Banner du serveur
            $this->read($socket);

            // EHLO
            $this->write($socket, "EHLO " . (gethostname() ?: 'localhost'));
            $ehlo = $this->read($socket);

            // STARTTLS si on est en TCP et que le serveur le propose
            if ($this->port !== 465 && str_contains($ehlo, 'STARTTLS')) {
                $this->write($socket, "STARTTLS");
                $this->read($socket);
                stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
                // Renvoyer EHLO après TLS
                $this->write($socket, "EHLO " . (gethostname() ?: 'localhost'));
                $this->read($socket);
            }

            // AUTH LOGIN
            $this->write($socket, "AUTH LOGIN");
            $this->read($socket);
            $this->write($socket, base64_encode($this->username));
            $this->read($socket);
            $this->write($socket, base64_encode($this->password));
            $authResp = $this->read($socket);

            if (!str_starts_with(trim($authResp), '235')) {
                error_log("[Mailer] Authentification SMTP échouée : " . trim($authResp));
                fclose($socket);
                return false;
            }

            // MAIL FROM
            $this->write($socket, "MAIL FROM:<{$this->fromEmail}>");
            $this->read($socket);

            // RCPT TO
            $this->write($socket, "RCPT TO:<$to>");
            $rcptResp = $this->read($socket);
            if (!str_starts_with(trim($rcptResp), '250')) {
                error_log("[Mailer] RCPT TO refusé : " . trim($rcptResp));
                fclose($socket);
                return false;
            }

            // DATA
            $this->write($socket, "DATA");
            $this->read($socket);

            // Construction des headers
            $encodedFrom    = $this->fromName
                ? '=?UTF-8?B?' . base64_encode($this->fromName) . '?= <' . $this->fromEmail . '>'
                : $this->fromEmail;
            $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
            $replyToHeader  = $replyTo ? "Reply-To: $replyTo\r\n" : '';

            $msg  = "From: $encodedFrom\r\n";
            $msg .= "To: $to\r\n";
            $msg .= "Subject: $encodedSubject\r\n";
            $msg .= $replyToHeader;
            $msg .= "MIME-Version: 1.0\r\n";
            $msg .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $msg .= "Content-Transfer-Encoding: base64\r\n";
            $msg .= "X-Mailer: Portfolio-SAE601\r\n";
            $msg .= "\r\n";
            $msg .= chunk_split(base64_encode($body));
            $msg .= "\r\n.";

            $this->write($socket, $msg);
            $this->read($socket);

            // QUIT
            $this->write($socket, "QUIT");
            fclose($socket);

            return true;

        } catch (\Throwable $e) {
            error_log("[Mailer] Exception : " . $e->getMessage());
            return false;
        }
    }

    private function write($socket, string $cmd): void
    {
        fwrite($socket, $cmd . "\r\n");
    }

    private function read($socket): string
    {
        $response = '';
        while ($line = fgets($socket, 512)) {
            $response .= $line;
            // Le 4ème caractère est ' ' sur la dernière ligne multi-lignes
            if (!isset($line[3]) || $line[3] === ' ') break;
        }
        return $response;
    }
}
