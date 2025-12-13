# Secret Management in GitHub Actions

For deployment and notifications, you need to store sensitive information like SSH keys and email credentials as GitHub secrets.

## SSH Deployment Secrets

To deploy to a server via SSH, you need to configure the following secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

- `SSH_HOST`: The hostname or IP address of your deployment server.
- `SSH_USERNAME`: The username for the SSH connection.
- `SSH_PRIVATE_KEY`: The private SSH key that has access to your server. Make sure the corresponding public key is in the `~/.ssh/authorized_keys` file on your server for the specified user.

## Email Notification Secrets

For sending email notifications, you'll need secrets for your email provider. For Gmail, this would be:

- `MAIL_USERNAME`: Your Gmail address.
- `MAIL_PASSWORD`: An "App Password" for your Google account. You cannot use your regular password. You need to enable 2-Step Verification to create App Passwords.

**Never hardcode secrets in your workflow files.** Always use `secrets.SECRET_NAME` to access them.
