export default class Marketing {
    update({ id, userName }) {
        /*
        its important to remember that the function [update] is responsible of handling
        his errors/exceptions, so if the function is not able to send the email
        */
        console.log(`[${id}]: [marketing] will send an welcome email to ${userName}`);
    }
}