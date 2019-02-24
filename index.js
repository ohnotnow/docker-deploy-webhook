var express = require('express');
var app = express();
const Deployer = require('./Deployer');

app.use(express.json());

const PORT = process.env.DEPLOYER_PORT || 7777;
const PROJECT_DIR = process.env.DEPLOYER_BASEDIR || "/tmp";

app.post('/deploy/:project', (req, res) => {
    const project = req.params.project;
    const projectPath = `${PROJECT_DIR}/${project}`;
    const deployment = new Deployer({
        project: project,
        projectPath: projectPath,
        jsonParams: req.body
    });

    if (deployment.invalidSecret()) {
        res.status(401);
        res.end();
        return;
    }

    if (!deployment.ensureProjectIsDeployable()) {
        res.status(400);
        res.send({ msg: "No such project and no stack given" });
        return;
    }


    try {
        deployment.deployStack();
    } catch (err) {
        deployment.recordLog(`ERROR DEPLOYING! ${err}`);
        res.status(500);
        res.send({ msg: "Error while deploying" });
        res.end();
        return;
    }

    res.send({ msg: 'ok' });
    res.end();
});

app.listen(PORT, () => console.log(`Docker stack deployer listening on port ${PORT}!`));
