exports={
            "scheme": "https",
            "host": "github.com",
            "apiHost": "api.github.com",
            "searchHost": "api.github.com",
            "rawUrlPattern": "https://raw.github.com/{owner}/{repo}/{version}/{file}",
            "searchPath": "/legacy/repos/search/{query}?language=JavaScript",
            "searchOverrides": {
                "amd": {
                    "underscore": "amdjs/underscore",
                    "backbone": "amdjs/backbone"
                }
            },
            "typeOverrides": {
                "dojo/dijit": "directory"
            },

            "auth": {
                "domain": "https://api.github.com",
                "authPath": "/authorizations",
                "scopes": ["repo"],
                "note": "Allow volo to interact with your repos.",
                "noteUrl": "https://github.com/volojs/volo"
            }
        }