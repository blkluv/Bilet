const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto')

const PORT = process.env.PORT || 3002;

const { createJob, finishAllJobs, finishSingleJob } = require('./script/cronJob');
const { removeUserFromUserList } = require("./utils/user")
const { sendMail } = require('./script/mail');


var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.listen(PORT, () => {
    console.log(`PORT:${PORT} dinleniyor.\n`);
});

app.get('/', (req, res) => {
    res.send('');
});


let activeUsers = []

app.post('/', (req, res) => {
    const { from, to, date, mail, amount } = req.body;
    const id = randomUUID()

    if (activeUsers.forEach((user) => user.mail === mail)) {
        console.log('bu mail ile zaten arama oluşturulmuş\n');
        return res.status(200).send({
            code: 0,
            text: 'Zaten arama oluşturdunuz',
        });
    }



    createJob(from, to, date, mail, activeUsers, amount, id);
    sendMail(mail, {
        subject: 'BİLET ARAMAYA BAŞLADIM',
        text: `\n${date} tarihi için ${amount} adet bilet aramaya başladım.\n\n Bilet bulduğumda haber vereceğim.`,
    });

    console.log('Tren bileti Aranmaya Başlıyor.');
    console.log('Active users :\n');

    activeUsers.forEach((user) => {
        console.log('---' + user.mail);
    });

    console.log('\n');

    return res.status(200).send({
        code: 1,
        text: 'Bilet aranmaya başlıyor.',
    });
});

app.post('/finishSingleJob', (req, res) => {
    const mail = req.body.mail.toLowerCase();

    let id = removeUserFromUserList(activeUsers, mail)

    if (id !== undefined) {
        finishSingleJob(id)

        return res.status(200).send({
            code: 2,
            text: 'Aramanız silinmiştir.',
        });
    } else {
        return res.status(200).send({
            code: 2,
            text: 'Bu mail üzerine kayıtlı arama bulunamamıştır.',
        });
    }
});

app.post('/FinsihAllJobs', (req, res) => {
    res.send('tüm işlemler sonlandırıldı');
    finishAllJobs(activeUsers);
});


