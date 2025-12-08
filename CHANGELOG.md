# Changelog

## [3.5.1] - 2024-12-08

### Changed
- **Region field now appears FIRST** in credentials file (right after profile name)
- Improved credentials file format for better AWS CLI compatibility

### Example Output
```ini
[default]
region=cn-north-1
aws_access_key_id=ASIAXXXXXXXXXXX
aws_secret_access_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
aws_session_token=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## [3.5.0] - 2024-12-08

### Added
- **AWS China Region Support**: Full support for AWS China partition (`arn:aws-cn:`)
  - Automatic detection of AWS partition from ARN
  - Uses correct STS endpoint for China: `https://sts.cn-north-1.amazonaws.com.cn`
  - Supports AWS GovCloud partition (`arn:aws-us-gov:`) as well
  - **Automatically adds `region` field to credentials file** based on detected partition
- **Custom SAML URL Support**: Monitor SAML responses from custom URLs
  - Configure custom SAML URLs in Options page (e.g., `https://signin.amazonaws.cn/saml`)
  - Support for multiple custom URLs
  - Automatic wildcard pattern generation for URL matching

### Fixed
- Fixed regex patterns to properly match AWS China and GovCloud ARNs
  - Updated from `/arn:aws:iam:/` to `/arn:aws(-cn|-us-gov)?:iam:/`
  - Prevents "Cannot read properties of null" error when using China regions
- Fixed async loading issue where CustomUrls wasn't loaded on startup
- Fixed listener not updating when custom URLs are added/changed
- Added null checks and error handling for ARN extraction

### Changed
- Improved logging throughout the extension for better debugging
- Listener now re-registers when options are saved
- STS client configuration now dynamically selects endpoint based on partition

## [3.4.1] - 2024-12-08

### Added
- Initial custom SAML URL support (incomplete)

### Fixed
- Async loading improvements

## [3.3] - Previous Version

See GitHub releases for earlier changelog entries.
