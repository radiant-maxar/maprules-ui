// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  maprules: 'http://localhost:3001',
  maprulesConfig: 'http://localhost:3001/config',
  taginfo: 'https://taginfo.openstreetmap.org/api/4/',
  osm: 'http://localhost:3000',
  id: 'http://localhost:8080/#map?',
  josm: 'http://127.0.0.1:8111',
  docs: 'https://github.com/radiant-maxar/maprules/blob/develop/README.md'
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
