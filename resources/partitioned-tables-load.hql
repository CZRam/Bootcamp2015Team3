!echo "******* LOADING DATA *******";

LOAD DATA INPATH '/data/registration/master/' OVERWRITE INTO TABLE p_master;
!echo "******* Successfully Loaded Master Data *******";

LOAD DATA INPATH '/data/registration/aircraft/' OVERWRITE INTO TABLE p_acftref;
!echo "******* Successfully Loaded Acftref Data *******";

LOAD DATA INPATH '/data/adsb/site01/2014/' OVERWRITE INTO table p_adsb PARTITION(siteid = 'site01', year = 2014);
LOAD DATA INPATH '/data/adsb/site02/2014/' OVERWRITE INTO table p_adsb PARTITION(siteid = 'site02', year = 2014);

!echo "******* Successfully Loaded ADSB Site Data *******";

!echo "******* FINISHED LOADING DATA *******";
