(function() {
  'use strict';

  describe('ProfileEditAccountController', function() {

    var ProfileEditAccountController,
        $httpBackend,
        messageCenterService,
        Authentication;

    var user = {
      _id: 'user',
      displayName: 'User',
      emailTemporary: 'foo@foo.com'
    };

    // Load the main application module
    beforeEach(module(AppConfig.appModuleName));

    beforeEach(inject(function(
      $templateCache,
      _$httpBackend_,
      _Authentication_,
      _messageCenterService_
    ) {
      $httpBackend = _$httpBackend_;
      Authentication = _Authentication_;

      messageCenterService = _messageCenterService_;
      spyOn(messageCenterService, 'add').and.callThrough();

      $templateCache.put('/modules/pages/views/home.client.view.html', '');
    }));

    afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Logged in user', function() {

      beforeEach(function(done) {
        inject(function($controller) {
          Authentication.user = user;
          ProfileEditAccountController = $controller('ProfileEditAccountController', {
            messageCenterService: messageCenterService
          });
          done();
        });
      });

      describe('change email address', function() {

        it('can update email address', function() {
          ProfileEditAccountController.user.emailTemporary = 'new@email.com';
          var expectedPutData = {
            _id: 'user',
            displayName: 'User',
            emailTemporary: 'new@email.com'
          };
          $httpBackend.expect('PUT', '/api/users', expectedPutData).respond(200);
          ProfileEditAccountController.updateUserEmail();
          $httpBackend.flush();
          expect(messageCenterService.add).toHaveBeenCalledWith(
            'success',
            'Check your email for further instructions.'
          );
        });

        it('can show an error message during failure', function() {
          ProfileEditAccountController.user.emailTemporary = 'new@email.com';
          $httpBackend.expect('PUT', '/api/users').respond(500);
          ProfileEditAccountController.updateUserEmail();
          $httpBackend.flush();
          expect(ProfileEditAccountController.emailError).toEqual('Something went wrong.');
        });

        it('can show a custom error message during failure', function() {
          ProfileEditAccountController.user.emailTemporary = 'new@email.com';
          $httpBackend.expect('PUT', '/api/users').respond(400, { message: 'custom error' });
          ProfileEditAccountController.updateUserEmail();
          $httpBackend.flush();
          expect(ProfileEditAccountController.emailError).toEqual('custom error');
        });

      });

      describe('resend email confirmation', function() {

        it('can resend email', function() {
          $httpBackend.expect('POST', '/api/auth/resend-confirmation').respond(200);
          ProfileEditAccountController.resendUserEmailConfirm();
          $httpBackend.flush();
          expect(messageCenterService.add).toHaveBeenCalledWith(
            'success',
            'Confirmation email resent.'
          );
        });

        it('can show an error message during failure', function() {
          $httpBackend.expect('POST', '/api/auth/resend-confirmation').respond(500);
          ProfileEditAccountController.resendUserEmailConfirm();
          $httpBackend.flush();
          expect(messageCenterService.add).toHaveBeenCalledWith(
            'danger',
            'Error: Something went wrong.'
          );
        });

        it('can show an custom error message during failure', function() {
          $httpBackend.expect('POST', '/api/auth/resend-confirmation').respond(400, {
            message: 'my custom error'
          });
          ProfileEditAccountController.resendUserEmailConfirm();
          $httpBackend.flush();
          expect(messageCenterService.add).toHaveBeenCalledWith(
            'danger',
            'Error: my custom error'
          );
        });

      });

    });

  });

}());
