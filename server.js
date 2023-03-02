"use strict";
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
    origin: true, // 모든 출처 허용 옵션. true 를 써도 된다.
}));

// (post) QR 코드 찍었을 때
app.post('/qr', async (req,res)=>{
    console.log('qr');
    const userId = req.body.userId;
    const code = req.body.code;
    if (!code) res.json({message:"오류!"});
    try {
        // 특정 장소 DB 정보 업데이트 및 포인트 증가
        await MainService.updateVisitedStatus(code);
        // 방문 코스 체크
        db.query(`UPDATE bdcb_members SET ${code}='Y' WHERE id='${userId}'`);
        // 포인트 적립
        db.query(`UPDATE bdcb_members SET point=point+500 WHERE id='${userId}'`);
        return res.status(200).json({ code: "OK", message: "방문 완료" });
    } catch (e) {
        if (e.code) return res.status(e.status).json({ code: e.code, message: e.message });
        else return res.json({message:"오류!"});
    }
});
// 로그인 체크
app.post('/logcheck',(req,res)=>{
    console.log('logcheck')
    const { logid, logpass } = req.body;
    db.query(`select * from bdcb_members where id=${logid}`, (err,data) => {
        //연결된 db에 query문 날리고 결과는 콜백에 들어온다.
        if (!data) res.json({ logchk: "false", error: "아이디 오류!" });
        if (!err) {
            if (data.pass === logpass) {
                res.json({ logchk: "true", userInfo: data });
            } else {
                res.json({ logchk: "false", error: "비밀번호 오류!" });
            }
        } else {
            res.json({ logchk: "false", error: "통신에러!" });
        }
    })
});
app.get('/logcheck',(req,res)=>{
    console.log('logcheck');
    res.send('아무');
});

// 코스 정보 불러오기
app.post('/coursedata',(req,res)=>{
    console.log('/coursedata')
    const { logid } = req.body;
    db.query(`select * from bdcb_members where id=${logid}`, (err,data) => {
        //연결된 db에 query문 날리고 결과는 콜백에 들어온다.
        if (!err) {
            res.json({ chk: "true", userInfo: data });
        } else {
            res.json({ chk: "false", error: "통신에러!" });
        }
    })
});

// myroom 정보 불러오기
app.post('/myroom',(req,res)=>{
    console.log('myroom')
    const { userId } = req.body;
    db.query(`select * from bdcb_members where id=${userId}`, (err,data) => {
        //연결된 db에 query문 날리고 결과는 콜백에 들어온다.
        if (!err) {
            res.json({ chk: "true", userInfo: data });
        } else {
            res.json({ chk: "false", error: "통신에러!" });
        }
    })
});

// 회원가입
app.post('/signup',(req,res)=>{
    const { username, email, callnum, id, pw} = req.body;
    console.log('signup')
    db.query(`select * from bdcb_members where id=${id}`, (err,data) => {
        //연결된 db에 query문 날리고 결과는 콜백에 들어온다.
        if (!err) {
            // DB에 일치 아이디가 없을 때
            if (!data) {
                db.query(`INSERT INTO 'bdcb_members' ('name', 'id', 'pass', 'email', 'tel', 'log_form', 'point') VALUES (${username}, ${id}, ${pw}, ${email}, ${callnum}, 'basic', 0)`, (err,data) => {
                    //연결된 db에 query문 날리고 결과는 콜백에 들어온다.
                    if (!err) {
                        db.query(`select * from bdcb_members where id=${id}`, (err,data) => {
                            //연결된 db에 query문 날리고 결과는 콜백에 들어온다.
                            if (!err) {
                                //console.log(data)//쿼리실행문 결과
                                res.json({ logchk: "true", userInfo: data });
                            } else {
                                res.json({ logchk: "false", error: "통신에러!(최종호출)" });
                            }
                        })
                    } else {
                        res.json({ logchk: "false", error: "통신에러!(삽입)" });
                    }
                })
            } else {
                res.json({ logchk: "false", error: "가입된 아이디입니다." });
            };
        } else {
            res.json({ logchk: "false", error: "통신에러!(가입폼)" });
        }
    })
});

// 찜 목록 체크
app.post('/wishup',(req,res)=>{
    const userId = localStorage.getItem('userId');
    const { wshnum, wshchk } = req.body;
    console.log('wishup')
    if (wshchk === 'Y') {
        db.query(`UPDATE bdcb_members SET ${wshnum}='Y' WHERE id='${userId}'`, (err,data) => {
            //연결된 db에 query문 날리고 결과는 콜백에 들어온다.
            if (!err) {
                //console.log(data)//쿼리실행문 결과
                res.send(data)
            } else {
                console.log(err)
            }
        })
    } else {
        db.query(`UPDATE bdcb_members SET ${wshnum}='N' WHERE id='${userId}'`, (err,data) => {
            //연결된 db에 query문 날리고 결과는 콜백에 들어온다.
            if (!err) {
                //console.log(data)//쿼리실행문 결과
                res.send(data)
            } else {
                console.log(err)
            }
        })
    }
});

app.listen(8080, function(){
    console.log('on 8080');
});