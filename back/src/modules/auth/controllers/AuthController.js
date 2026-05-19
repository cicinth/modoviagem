export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (request, response, next) => {
    try {
      response.status(201).json(await this.authService.register(request.body));
    } catch (error) {
      next(error);
    }
  };

  login = async (request, response, next) => {
    try {
      response.json(await this.authService.login(request.body));
    } catch (error) {
      next(error);
    }
  };

  me = async (request, response, next) => {
    try {
      const user = await this.authService.getUserById(request.user.id);

      if (!user) {
        response.status(404).json({ message: "Usuário não encontrado" });
        return;
      }

      response.json({ user });
    } catch (error) {
      next(error);
    }
  };
}
