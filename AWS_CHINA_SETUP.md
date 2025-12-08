# AWS China Region Setup Guide

## Overview

This extension now fully supports AWS China regions! The extension automatically detects when you're using AWS China and configures the correct STS endpoint.

## What's Different in AWS China?

- **ARN Format**: `arn:aws-cn:iam::123456789012:role/RoleName` (note the `-cn`)
- **SAML URL**: `https://signin.amazonaws.cn/saml` (instead of `.com`)
- **STS Endpoint**: `https://sts.cn-north-1.amazonaws.com.cn`

## Setup Instructions

### 1. Install the Extension

Follow the standard installation in `INSTALL.md`

### 2. Configure Custom SAML URL

1. Click the extension icon
2. Click "Options"
3. Scroll to "Custom SAML URLs" section
4. Add: `https://signin.amazonaws.cn/saml`
5. Click "Save"

### 3. Enable Debug Logs (Recommended)

1. In Options, set "Enable DEBUG logs" to "yes"
2. Click "Save"

### 4. Verify Configuration

1. Go to `chrome://extensions/`
2. Find "SAML to AWS STS Keys Conversion"
3. Click "Inspect views: service worker"
4. You should see in console:
   ```
   INFO: Loaded CustomUrls from storage:
   ['https://signin.amazonaws.cn/saml']
   INFO: Monitoring URLs:
   ['https://signin.aws.amazon.com/saml', 'https://signin.amazonaws.cn/saml', 'https://signin.amazonaws.cn/saml/*']
   ```

## Testing with AWS China

### 1. Login to AWS China Console

Navigate to your SAML login page (e.g., through your corporate SSO portal)

### 2. Complete Authentication

Enter your credentials and complete the SAML authentication

### 3. Check Console Output

In the service worker console, you should see:

```
INFO: onBeforeRequest event hit!
INFO: jsObj
{Response: {...}}
INFO: Extracting ARNs from roleClaimValue: arn:aws-cn:iam::123456789012:role/YourRole,arn:aws-cn:iam::123456789012:saml-provider/YourProvider
RoleArn: arn:aws-cn:iam::123456789012:role/YourRole
PrincipalArn: arn:aws-cn:iam::123456789012:saml-provider/YourProvider
INFO: Detected AWS China partition, using China STS endpoint
INFO: Using STS endpoint: https://sts.cn-north-1.amazonaws.com.cn
INFO: AWSAssumeRoleWithSAMLCommand client.send will now be executed
INFO: AWSAssumeRoleWithSAMLCommand client.send is done!
Generate AWS tokens file.
```

### 4. Verify Credentials File

Check your Downloads folder for the `credentials` file:

```ini
[default]
region=cn-north-1
aws_access_key_id=ASIA...
aws_secret_access_key=...
aws_session_token=...
```

**Note:** The `region` field is automatically added at the top based on the detected AWS partition:
- AWS China: `region=cn-north-1`
- AWS GovCloud: `region=us-gov-west-1`
- AWS Standard: `region=us-east-1`

## Troubleshooting

### Error: "Cannot read properties of null (reading '0')"

**This was the original error - now fixed!**

**Cause**: The regex pattern didn't match AWS China ARNs (`arn:aws-cn:`)

**Solution**: Update to v3.5.0 which includes the fix

### Error: Network timeout or connection refused

**Possible causes**:
1. Network restrictions in China
2. VPN or proxy configuration needed
3. Firewall blocking STS endpoint

**Solutions**:
- Ensure you can access `sts.cn-north-1.amazonaws.com.cn`
- Check if VPN is required for AWS China access
- Verify network connectivity to AWS China endpoints

### SAML Response Not Captured

**Check**:
1. Verify custom URL is configured: `https://signin.amazonaws.cn/saml`
2. Check console shows URL in monitoring list
3. Look at Network tab in DevTools to see exact URL being called
4. Add the exact URL pattern if different

### Wrong STS Endpoint Used

**Check console logs**:
- Should show: `INFO: Detected AWS China partition, using China STS endpoint`
- Should show: `INFO: Using STS endpoint: https://sts.cn-north-1.amazonaws.com.cn`

If not detected:
- Verify your ARN contains `arn:aws-cn:`
- Check console for ARN extraction logs

## Supported AWS Partitions

| Partition | ARN Format | STS Endpoint | Status |
|-----------|------------|--------------|--------|
| AWS Standard | `arn:aws:iam::...` | `sts.amazonaws.com` (global) | ✅ Supported |
| AWS China | `arn:aws-cn:iam::...` | `sts.cn-north-1.amazonaws.com.cn` | ✅ Supported |
| AWS GovCloud | `arn:aws-us-gov:iam::...` | `sts.us-gov-west-1.amazonaws.com` | ✅ Supported |

## Additional Configuration for China

### Multiple Roles

If you need to assume additional roles in AWS China:

1. In Options, scroll to "Role ARN's" section
2. Add profile name and China role ARN:
   - Profile: `china-prod`
   - ARN: `arn:aws-cn:iam::123456789012:role/ProdRole`
3. Click "Save"

The extension will automatically detect the China partition and use the correct endpoint.

### Session Duration

AWS China supports the same session duration settings as standard AWS:
- Default: 1 hour (3600 seconds)
- Maximum: Configured on the IAM Role (up to 12 hours)

Configure in Options:
1. Set "Apply the session duration requested by the SAML provider" to "no"
2. Enter custom duration in seconds (e.g., 14400 for 4 hours)
3. Click "Save"

## Testing Checklist

- [ ] Extension installed and activated
- [ ] Custom URL configured: `https://signin.amazonaws.cn/saml`
- [ ] Debug logs enabled
- [ ] Console shows China URL in monitoring list
- [ ] Login successful through SAML
- [ ] Console shows "Detected AWS China partition"
- [ ] Console shows China STS endpoint being used
- [ ] Credentials file downloaded
- [ ] Credentials work with AWS CLI in China region

## Support

For issues specific to AWS China:
1. Check console logs for detailed error messages
2. Verify ARN format includes `arn:aws-cn:`
3. Confirm network access to `sts.cn-north-1.amazonaws.com.cn`
4. See main README.md for general troubleshooting

## Example: Complete Flow

```
1. User navigates to corporate SSO portal
2. User clicks "AWS China" login link
3. SAML authentication completes
4. POST request sent to: https://signin.amazonaws.cn/saml/acs/SAMLSABCDEXAMPLE
5. Extension captures SAML response
6. Extension extracts: arn:aws-cn:iam::123456789012:role/MyRole
7. Extension detects "aws-cn" partition
8. Extension calls: https://sts.cn-north-1.amazonaws.com.cn
9. STS returns temporary credentials
10. Extension downloads credentials file
11. User can now use AWS CLI with China region
```

Success! 🎉
