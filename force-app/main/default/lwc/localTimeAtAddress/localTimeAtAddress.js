import { LightningElement, track, api } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import { loadScript } from 'lightning/platformResourceLoader';
import MOMENT_JS from '@salesforce/resourceUrl/moment';
import MOMENT_TIMEZONE_JS from '@salesforce/resourceUrl/momentTimezone';
import LANG from '@salesforce/i18n/lang';

// All Data Integration Rules
// The base URL (in this case https://www.googleapis.com/ must be added to the CSP Trusted Sites in Setup)
const QUERY_URL =
    'https://maps.googleapis.com/maps/api/timezone/json?location=59.308440518196080,18.013601084849560&timestamp=1331161200&key=';


// dynamic location based on the Object
// timestamp
// key handling
// color depending of time of dynamic
// dynamic user time
// slider to change time like apple watch
// update time


export default class LocalTimeAtAddress extends LightningElement {
    @api recordId;
    @api googleKey;

    @track error;
    @track selectedDateTime = new Date().toISOString();
    @track customerTime;
    @track customerTimezone;



    renderedCallback() {
        if (this.momentjsInitialized) {
            return;
        }
        this.momentjsInitialized = true;
        let googleUrl = QUERY_URL + this.googleKey;

        fetch(googleUrl)
            .then(response => {
                // fetch isn't throwing an error if the request fails.
                // Therefore we have to check the ok property.
                if (!response.ok) {
                    this.error = response;
                }
                return response.json();
            })
            .then(jsonResponse => {
                console.log(jsonResponse);
                this.customerTimezone = jsonResponse;
            })
            .catch(error => {
                this.error = error;
                this.customerTimezone = undefined;
            });

        loadScript(this, MOMENT_JS)
            .then(() => {
                loadScript(this, MOMENT_TIMEZONE_JS)
                    .then(() => {
                        this.setMomentValues(this.selectedDateTime);
                    })
                    .catch(error => {
                        this.error = error;
                    });
            })
            .catch(error => {
                this.error = error;
            });
    }

    setMomentValues(dateTime) {
        var usersTime    = moment.tz(dateTime, "Australia/Melbourne");
        var customerTime = usersTime.clone().tz("Europe/Stockholm");

        console.log(usersTime.format());
        console.log(customerTime.format());
        console.log(LANG);
        console.log(moment.locale(LANG));
        // const dateTimeFormat = new Intl.DateTimeFormat(LANG, options);
        this.customerTime = customerTime.format('LT');
    }

    handleDateTimeChange(event) {
        this.setMomentValues(event.target.value);
    }
}