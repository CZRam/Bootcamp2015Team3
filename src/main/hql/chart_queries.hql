--- Flat view of MFR Model and Type
CREATE TABLE acft_mfr_model_t as
 	SELECT a.code, substr(a.code,0,5) mfr_model_code, first_value(a.mfr) over (partition by substr(a.code,0,5)) mfr, first_value(a.model) over (partition by substr(a.code,0,5)) model
from acftref a



----- PIE Chart those without ADSB by mfr and model
  select distinct cnt, v.mfr, v.model from
(SELECT count(*) cnt,substr(mfrmdlcode,0,5) mfr_model_code 
from default.master
 left join (select distinct rtrim(hexid)hexid from default.adsb) a on a.hexid = rtrim(modescodehex)
where a.hexid is null
        and master.state = 'MA'
and  master.expirationdate > from_unixtime(unix_timestamp(),'YYYYMMdd')
group by substr(mfrmdlcode,0,5)) m
inner join (select distinct mfr_model_code, mfr, model from acft_mfr_model_t) v on v.mfr_model_code = m.mfr_model_code  
sort by cnt desc

------ PIE Chart those without ADSB by Type
SELECT cnt, m.typeregistrant from
(SELECT count(*) cnt,typeregistrant
from default.master
 left join (select distinct rtrim(hexid)hexid from default.adsb) a on a.hexid = rtrim(modescodehex)
where a.hexid is null
        and master.state = 'MA'
and  master.expirationdate > from_unixtime(unix_timestamp(),'YYYYMMdd')
group by substr(mfrmdlcode,0,5)) m
inner join (select distinct mfr_model_code, mfr, model from acft_mfr_model_t) v on v.mfr_model_code = m.mfr_model_code  


------ STACKED Bar Chart With/Without ADSB by MFR and Model
select sum(x.without_count) wo, sum(x.with_count) w,  x.mfr, x.model, x.mfr_model_code
from (
SELECT cnt without_count, 0 with_count, v.mfr, v.model, m.mfr_model_code from
(SELECT count(*) cnt,substr(mfrmdlcode,0,5) mfr_model_code 
from default.master
 left join (select distinct rtrim(hexid)hexid from default.adsb) a on a.hexid = rtrim(modescodehex)
where a.hexid is null
        and master.state = 'MA'
and  cast(master.expirationdate as BIGINT) > cast(from_unixtime(unix_timestamp(),'YYYYMMdd') as BIGINT)
group by substr(mfrmdlcode,0,5)) m
inner join (select distinct mfr_model_code, mfr, model from acft_mfr_model_t) v on v.mfr_model_code = m.mfr_model_code  
UNION
 select 0 without_count,  cnt with_count, v.mfr, v.model, m.mfr_model_code from
(SELECT count(*) cnt,substr(mfrmdlcode,0,5) mfr_model_code 
from default.master
 inner join (select distinct rtrim(hexid)hexid from default.adsb) a on a.hexid = rtrim(modescodehex)
        and master.state = 'MA'
and  cast(master.expirationdate as BIGINT) > cast(from_unixtime(unix_timestamp(),'YYYYMMdd') as BIGINT)
group by substr(mfrmdlcode,0,5)
) m
inner join (select distinct mfr_model_code, mfr, model from acft_mfr_model_t) v on v.mfr_model_code = m.mfr_model_code  
) x
group by x.mfr, x.model, x.mfr_model_code


------ Full data table

create or replace view ADSB_METRICS_TABLE_V as
SELECT v.mfr_model_code mfr_model_code, v.mfr, v.model,m.name,typeregistrant, 1 as with_adsb
  from default.master m
    inner join (select distinct rtrim(hexid) hexid from default.adsb) a on a.hexid = rtrim(m.modescodehex)
      inner  join acft_mfr_model_t v on v.code = m.mfrmdlcode
where   m.state = 'MA'
and  m.expirationdate > from_unixtime(unix_timestamp(),'YYYYMMdd')
UNION
SELECT v.mfr_model_code mfr_model_code, v.mfr, v.model, m.name,typeregistrant, 0 as with_adsb
  from default.master m
    left join (select distinct rtrim(hexid) hexid from default.adsb) a on a.hexid = rtrim(m.modescodehex)
inner join acft_mfr_model_t v on v.code = m.mfrmdlcode
      where a.hexid is null
        and m.state = 'MA'
and  m.expirationdate > from_unixtime(unix_timestamp(),'YYYYMMdd')

set hive.cli.print.header=true;
INSERT OVERWRITE LOCAL DIRECTORY '/media/sf_Downloads/bootcamp/metrics_table
ROW FORMAT DELIMITED
 	FIELDS TERMINATED BY ‘\t’
 	STORED AS TEXTFILE
SELECT * ADSB_METRICS_TABLE_V;