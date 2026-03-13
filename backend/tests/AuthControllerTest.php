<?php
use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../core/Controller.php';
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../middleware/AuthMiddleware.php';
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../models/User.php';

class AuthControllerTest extends TestCase
{
    private $userModelMock;
    private $controllerMock;

    protected function setUp(): void
    {
        // Mock User Model
        $this->userModelMock = $this->createMock(User::class);
        
        // Partial mock of AuthController to override getRequestBody and jsonResponse
        $this->controllerMock = $this->getMockBuilder(AuthController::class)
            ->setConstructorArgs([$this->userModelMock])
            ->onlyMethods(['getRequestBody', 'jsonResponse'])
            ->getMock();
    }

    public function testJwtGenerationAndDecoding()
    {
        $payload = ['user_id' => 1, 'email' => 'test@example.com', 'role' => 'admin'];
        $token = AuthMiddleware::generateToken($payload);

        $this->assertIsString($token);
        $this->assertNotEmpty($token);

        $decoded = AuthMiddleware::decodeToken($token);
        $this->assertEquals(1, $decoded['user_id']);
        $this->assertEquals('test@example.com', $decoded['email']);
    }

    public function testVerifyEndpointRejectsMissingToken()
    {
        // Reset request
        unset($_REQUEST['auth_user']);

        // Expect jsonResponse to be called with 401
        $this->controllerMock->expects($this->once())
            ->method('jsonResponse')
            ->with(['error' => 'Token invalide'], 401);

        $this->controllerMock->verify();
    }

    public function testVerifyEndpointAcceptsValidToken()
    {
        // Mock request auth_user
        $_REQUEST['auth_user'] = ['user_id' => 1, 'email' => 'valid@test.com', 'role' => 'admin'];

        $this->controllerMock->expects($this->once())
            ->method('jsonResponse')
            ->with([
                'valid' => true,
                'user' => [
                    'user_id' => 1,
                    'email' => 'valid@test.com',
                    'role' => 'admin'
                ]
            ]);

        $this->controllerMock->verify();
    }

    public function testLoginSuccess()
    {
        $this->controllerMock->expects($this->once())
            ->method('getRequestBody')
            ->willReturn(['email' => 'admin@test.com', 'password' => 'password123']);

        $userRecord = [
            'id' => 1,
            'email' => 'admin@test.com',
            'password' => '$2y$10$hashedpassword', // Example hash
            'role' => 'admin'
        ];

        $this->userModelMock->expects($this->once())
            ->method('findByEmail')
            ->with('admin@test.com')
            ->willReturn($userRecord);

        $this->userModelMock->expects($this->once())
            ->method('verifyPassword')
            ->with('password123', '$2y$10$hashedpassword')
            ->willReturn(true);

        $this->controllerMock->expects($this->once())
            ->method('jsonResponse')
            ->with(
                $this->callback(function ($response) {
                    return isset($response['token']) 
                        && $response['message'] === 'Connexion réussie'
                        && !isset($response['user']['password']);
                })
            );

        $this->controllerMock->login();
    }

    public function testLoginFailsIfUserNotFound()
    {
        $this->controllerMock->expects($this->once())
            ->method('getRequestBody')
            ->willReturn(['email' => 'unknown@test.com', 'password' => 'password123']);

        $this->userModelMock->expects($this->once())
            ->method('findByEmail')
            ->with('unknown@test.com')
            ->willReturn(null);

        $this->controllerMock->expects($this->once())
            ->method('jsonResponse')
            ->with(['error' => 'Email ou mot de passe incorrect'], 401);

        $this->controllerMock->login();
    }
    
    public function testLoginFailsIfPasswordIncorrect()
    {
        $this->controllerMock->expects($this->once())
            ->method('getRequestBody')
            ->willReturn(['email' => 'admin@test.com', 'password' => 'wrongpass']);

        $userRecord = [
            'id' => 1,
            'email' => 'admin@test.com',
            'password' => '$2y$10$hashedpassword',
            'role' => 'admin'
        ];

        $this->userModelMock->expects($this->once())
            ->method('findByEmail')
            ->with('admin@test.com')
            ->willReturn($userRecord);

        $this->userModelMock->expects($this->once())
            ->method('verifyPassword')
            ->with('wrongpass', '$2y$10$hashedpassword')
            ->willReturn(false);

        $this->controllerMock->expects($this->once())
            ->method('jsonResponse')
            ->with(['error' => 'Email ou mot de passe incorrect'], 401);

        $this->controllerMock->login();
    }
}
