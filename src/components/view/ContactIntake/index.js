import React, { Component } from 'react'

import muiThemeable from 'material-ui/styles/muiThemeable';

import TextField from 'material-ui/TextField'
import FlatButton from 'material-ui/FlatButton'
import Checkbox from 'material-ui/Checkbox';
import Toggle from 'material-ui/Toggle';
import Slider from 'material-ui/Slider';
import { Card, CardHeader, CardTitle, CardText } from 'material-ui/Card';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import DatePicker from 'material-ui/DatePicker';

import PeriodicQuestionsForm from 'components/view/ContactIntake/periodicQuestions.form';
import NewContactQuestionsForm from 'components/view/ContactIntake/newContactQuestions.form';
import OutreachQuestionsForm from 'components/view/ContactIntake/outreachQuestions.form';
import StandardQuestionsForm from 'components/view/ContactIntake/standardQuestions.form';

import * as moment from 'moment';

import './styles.css';


class IntakeForm extends Component {

    constructor(props) {
        super(props);

        this.submitForm = this.submitForm.bind(this)
        this.isNewContact = this.isNewContact.bind(this);

        const { match: { params } } = this.props;

        // TODO: prepopulate with personal info issue #34
        this.state = {

            showPeriodic: false,
            showOutreach: false,
            showNewContactQuestions: false,

            eventNotes: '',

            // form
            eventDate: this.getTodayDate(),


            // periodic
            housingStatus: 'homeless',
            hivStatus: 'neverTested',
            isInCareForHiv: false,
            hepCStatus: 'neverTested',
            isInCareForHepC: false,
            healthInsurer: null,
            primaryDrug: 'heroin',
            didOdLastYear: false,
            didSeeOdLastYear: false,
            hasHealthInsurance: false,
            otherDrugs: null,

            // new contact
            newContactDate: null,
            contactDateOfBirth: this.getInitialDateOfBirth(),
            contactGenderIdentity: 'Male',
            contactEthnicity: 'White',
            contactIsHispanic: false,
            contactCountryOfBirth: 'US',
            contactAgeOfFirstInjection: 0,

            // outreach
            syringesGiven: 0,
            syringesTaken: 0,
            narcanWasOffered: false,
            narcanWasTaken: false,
            enrollment: '',
            numberOfOthersHelping: 0,

            // standard
            // NOTE: it's very important here that we are getting the uid from the url, because if
            // the user does not exist (ie: it does not have an ID yet) then this will still allow
            // us to create the event and associate it with the contact that we will create in parallel
            // FIXME: ultimately we'll need to create the contact first, ensure that the creation is
            // successful, and then create the event, otherwise we may end up with orphaned events
            // and potentially lost data if the contact creation fails but the event creation does not
            uid: params.uid,
            referral: null,
        }

        this.initialState = this.state;
        this.submittedState = this.state;
    }

    isNewContact(contact){
        if(contact && contact.uid) {
            return false;
        }
        return true;
    }

    getInitialDateOfBirth() {
        return new Date(1980, 0, 1);
    };

    getTodayDate() {
        const todayDate = new Date();
        todayDate.setFullYear(todayDate.getFullYear());
        todayDate.setHours(0, 0, 0, 0);
        return todayDate;
    };

    // i'm sure we'll want to change names on the db in the future at some time
    // or locally within state. so I'm abstracting this call to make it clear what data
    // we send in event creation
    packageFormDataForSubmission() {
        const outreach = this.state.showOutreach ? {
            syringesGiven: this.state.syringesGiven,
            syringesTaken: this.state.syringesTaken,
            narcanWasOffered: this.state.narcanWasOffered,
            narcanWasTaken: this.state.narcanWasTaken,
            enrollment: this.state.enrollment,
            numberOfOthersHelping: this.state.numberOfOthersHelping,
        } : null;

         const standard = {
             referral: this.state.referral,
             location: this.state.eventLocation,
             contactUid: this.state.uid,
         }

        const periodic = this.state.showPeriodic ? {
            date: this.state.eventDate,
            housingStatus: this.state.housingStatus,
            hivStatus: this.state.hivStatus,
            isInCareForHiv: this.state.isInCareForHiv,
            hepCStatus: this.state.hepCStatus,
            isInCareForHepC: this.state.isInCareForHepC,
            healthInsurer: this.state.healthInsurer,
            primaryDrug: this.state.primaryDrug,
            didOdLastYear: this.state.didOdLastYear,
            didSeeOdLastYear: this.state.didSeeOdLastYear,
            hasHealthInsurance: this.state.hasHealthInsurance,
            otherDrugs: this.state.otherDrugs,
        } : null;

        const contactData = this.state.showNewContactQuestions ? {
            newContactDate: this.state.newContactDate,
            contactDateOfBirth: this.state.contactDateOfBirth,
            contactGenderIdentity: this.state.contactGenderIdentity,
            contactEthnicity: this.state.contactEthnicity,
            contactIsHispanic: this.state.contactIsHispanic,
            contactCountryOfBirth: this.state.contactCountryOfBirth,
            contactAgeOfFirstInjection: this.state.contactAgeOfFirstInjection,
        } : null;

        // dirty check to only submit data for visible forms
        let prunedEventData = {
           ...outreach,
           ...standard,
           ...periodic,
           ...contactData,
        };
        return prunedEventData;
    }

    submitForm() {
        // TODO: Ultimately should change these cases to prompts, not alert; but React errors for now
        // TODO: what about validation?
        if (this.initialState == this.state) {
        alert("Cannot post empty form");
        } else {
            this.props.createEvent();
            this.saveContact();

            const { match: { params } } = this.props;
            // TODO: 'form submitted successfully' or something dialog
            this.props.history.push(`/contact/${params.uid}/info`)
        }
    }

    // TODO: dispatch updated contact profile
    createEvent() {
        let eventData = this.packageFormDataForSubmission()
        this.props.createEvent(eventData);
    }

    saveContact() {
        const contact = {
            uid: this.state.uid,
            data: {
                dateOfBirth: this.state.contactDateOfBirth,
                genderIdentity: this.state.contactGenderIdentity,
                ethnicity: this.state.contactEthnicity,
                hispanic: this.state.contactIsHispanic,
                birthCountry: this.state.contactCountryOfBirth,
                firstInjectionAge: this.state.contactAgeOfFirstInjection,
            },
        };
        this.props.createContact(contact);
    }

    // helpers to build controlled input elements
    buildRadio(title, radioOptionsList, name, updateCallback) {
        let radioControls = radioOptionsList.map(option => (
            <RadioButton
                key={option.label}
                name={option.name}
                label={option.label}
                value={option.value}
            />
        ));

        let labelStyle = {
            color: this.props.palette.primary3Color,
            margin: '2rem 0 1rem 0'
        };

        return (
            <div>
                <div style={labelStyle}>{title}</div>
                <RadioButtonGroup
                    name={name}
                    onChange={updateCallback}
                    defaultSelected={this.props[name]}
                    valueSelected={this.props[name]}
                >
                    {radioControls}
                </RadioButtonGroup>
            </div>
        )
    };

    buildToggle(toggleName, stateName, updateCallback) {
        return (
            <Toggle
                label={toggleName}
                defaultToggled={false}
                labelPosition="right"
                toggled={this.props[stateName]}
                onToggle={(event, isInputChecked) => {
                    updateCallback(stateName, isInputChecked)
                }}
            />
        )
    };

    buildSelectField(title, selectOptionsList, name, updateCallback, multiple=false) {
        let selectControls = selectOptionsList.map(ethnicity => (
            <MenuItem
                key={ethnicity.value}
                primaryText={ethnicity.primaryText}
                value={ethnicity.value}
                name={name}
            />
        ));

        let labelStyle = {
            color: this.props.palette.primary3Color,
            margin: '2rem 0 1rem 0'
        };

        return (
            <div>
                <div style={labelStyle}>{title}</div>
                <SelectField
                    multiple={multiple}
                    value={this.props[name]}
                    style={{color: this.props.palette.primary1Color}}
                    name={name}
                    onChange={(e, index, value) => {
                        updateCallback(name, value)
                    }}
                >
                    {selectControls}
                </SelectField>
            </div>
        )
    };

    buildSlider(sliderName, labelText, sliderValue, updateCallback, overrides = {}) {
        let labelStyle = {
            color: this.props.palette.primary3Color,
            margin: '2rem 0 1rem 0'
        }
        const options = {
            defaultValue: overrides.defaultValue || 0,
            step: overrides.step || 1,
            min: overrides.min || 0,
            max: overrides.max || 15,
        }
        return (
            <div id={sliderName}>
            <div style={labelStyle}>{labelText}<span style={{paddingLeft: '.5rem', fontSize: '.5rem'}}>({sliderValue}/{options.max})</span></div>
                <Slider
                    name={sliderName}
                    defaultValue={parseInt(options.defaultValue)}
                    step={options.step}
                    min={options.min}
                    max={options.max}
                    value={parseInt(this.props[sliderName])}
                    onChange={(e, value) => updateCallback(sliderName, value)}
                />
            </div>
        )
    }

    handleSliderChange(name, value) {
        this.setState({
            [name]: value
        });
    };

    handleChildInputChange(event, value) {
        const target = event.target;
        const name = target.name;

        this.setState({
            [name]: value
        });
    };

    handleChildSelectChange(name, value) {
        this.setState({
            [name]: value
        });
    };

    handleChildToggleChange(name, isInputChecked) {
        this.setState({
            [name]: isInputChecked
        })
    }

    render() {

        const palette = this.props.muiTheme.palette;

        const clearLabelStyle = {
        color: palette.errorColor
        }

        const fieldsStyle = {
            padding: '2rem',
        };

        // checkboxes to select which forms to show
        const formCheckboxOptionsArray = [
            {
                label: 'Standard Questions',
                value: true, disabled: true
            },
            {
                label: 'First Contact',
                value: this.state.showNewContactQuestions, disabled: false, onCheckCallback: () => this.setState({showNewContactQuestions: !this.state.showNewContactQuestions})
            },
            {
                label: 'Periodic',
                value: this.state.showPeriodic, disabled: false, onCheckCallback: () => this.setState({showPeriodic: !this.state.showPeriodic})
            },
            {
                label: 'Outreach',
                value: this.state.showOutreach, disabled: false, onCheckCallback: () => this.setState({showOutreach: !this.state.showOutreach})
            },
        ];

        return (
            <form className="form">

                <Card>
                    <CardTitle title='Form Questions' titleColor={palette.primary1Color}/>
                    <div style={fieldsStyle}>
                    {/* FIXME: */}
                    <DatePicker
                        hintText="Date"
                        floatingLabelText="Date"
                        value={this.state.eventDate}
                        onChange={(e, date) => this.setState({eventDate: date})}
                        autoOk={true}
                    />
                    </div>
                    <div
                        className="row"
                        style={{padding: '2rem'}}
                        >
                        {formCheckboxOptionsArray.map(option => (
                            <Checkbox
                                className="col-xs-12 col-sm-6 col-md-3"
                                key={option.label}
                                labelStyle={option.labelStyle}
                                style={option.style}
                                label={option.label}
                                checked={option.value}
                                disabled={option.disabled}
                                onCheck={option.onCheckCallback}
                            />
                        ))}
                    </div>
                </Card>


                <StandardQuestionsForm
                    handleSelectChange={this.handleChildSelectChange.bind(this)}
                    buildSelectField={this.buildSelectField}
                    palette={palette}
                    // form data
                    referral={this.state.referral}
                />

                {this.state.showNewContactQuestions && <NewContactQuestionsForm
                    // helpers
                    handleChange={this.handleChildInputChange.bind(this)}
                    handleSelectChange={this.handleChildSelectChange.bind(this)}
                    handleChildToggleChange={this.handleChildToggleChange.bind(this)}
                    handleSliderChange={this.handleSliderChange.bind(this)}
                    buildToggle={this.buildToggle}
                    buildSelectField={this.buildSelectField}
                    buildRadio={this.buildRadio}
                    buildSlider={this.buildSlider}
                    palette={palette}
                    // form data
                    contactDateOfBirth={this.state.contactDateOfBirth}
                    contactGenderIdentity={this.state.contactGenderIdentity}
                    contactEthnicity={this.state.contactEthnicity}
                    contactIsHispanic={this.state.contactIsHispanic}
                    contactCountryOfBirth={this.state.contactCountryOfBirth}
                    contactAgeOfFirstInjection={this.state.contactAgeOfFirstInjection}
                />}

                {this.state.showPeriodic && <PeriodicQuestionsForm
                    // helpers
                    handleChange={this.handleChildInputChange.bind(this)}
                    handleSelectChange={this.handleChildSelectChange.bind(this)}
                    handleChildToggleChange={this.handleChildToggleChange.bind(this)}
                    buildToggle={this.buildToggle}
                    buildSelectField={this.buildSelectField}
                    buildRadio={this.buildRadio}
                    palette={palette}
                    // form data
                    housingStatus={this.state.housingStatus}
                    hivStatus={this.state.hivStatus}
                    isInCareForHiv={this.state.isInCareForHiv}
                    hepCStatus={this.state.hepCStatus}
                    isInCareForHepC={this.state.isInCareForHepC}
                    hasHealthInsurance={this.state.hasHealthInsurance}
                    healthInsurer={this.state.healthInsurer}
                    primaryDrug={this.state.primaryDrug}
                    otherDrugs={this.state.otherDrugs}
                    odLastYear={this.state.didOdLastYear}
                    sawOdLastYear={this.state.didSeeOdLastYear}
                />}

                {this.state.showOutreach && <OutreachQuestionsForm
                    // helpers
                    handleChange={this.handleChildInputChange.bind(this)}
                    handleChildToggleChange={this.handleChildToggleChange.bind(this)}
                    handleSliderChange={this.handleSliderChange.bind(this)}
                    buildToggle={this.buildToggle}
                    buildRadio={this.buildRadio}
                    buildSlider={this.buildSlider}
                    palette={palette}
                    // form data
                    syringesGiven={this.state.syringesGiven}
                    syringesTaken={this.state.syringesTaken}
                    narcanWasOffered={this.state.narcanWasOffered}
                    narcanWasTaken={this.state.narcanWasTaken}
                    enrollment={this.state.enrollment}
                    numberOfOthersHelping={this.state.numberOfOthersHelping}
                />}

                <Card>
                    <div className="textAreaContainer">
                    <TextField
                        multiLine={true}
                        rows={5}
                        fullWidth={true}
                        id="eventNotes"
                        floatingLabelText="Event Notes"
                        onChange={(e, value) => this.setState({eventNotes: value})}
                    />
                    </div>
                </Card>

                <Card>
                    <div className="textAreaContainer">
                    <TextField
                        multiLine={true}
                        rows={5}
                        fullWidth={true}
                        id="profileNotes"
                        floatingLabelText="Profile Notes"
                        onChange={(e, value) => this.setState({profileNotes: value})}
                    />
                    </div>
                </Card>

                <Card>
                    <div className="submitButtons">
                    {/* TODO: handle this in a more elegant way than just reloading the page */}
                    <FlatButton label="Clear Form" labelStyle={clearLabelStyle} onClick={() => window.location.reload()} />
                    <FlatButton label="Save" primary={true} onClick={this.submitForm} />
                    </div>
                </Card>
            </form>
        )
    }
}

export default muiThemeable()(IntakeForm);
